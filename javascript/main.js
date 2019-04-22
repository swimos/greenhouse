console.info('[main] Loading libraries ...');

// include our node server
const httpServer = require('./httpServer/server');

// include library for talking to ardunio
const ArduinoBoard = require('./modules/ArduinoBoard');

// grab command line argumenets
const commandLineArgs = process.argv

console.info('[main] Libraries loaded');

class Main {
    constructor() {
        this.botList = [];
        this.servicesList = [];
        this.httpServer = null;
        this.serviceConfig = null;
        this.args = {};
        this.arduino = null;

        this.processCommandLineArgs();
        this.loadConfig(this.args.config || 'localhost')

        if (this.showDebug) {
            console.info('[main] constructed');
        }
    }

    /**
     * Load up configuration values from config file
     * @param {*} configName 
     */
    loadConfig(configName) {
        if (this.showDebug) {
            console.info('[main] load config');
        }
        // load config
        this.serviceConfig = require('../config/node/'+configName+'Config.js');

        // toggle app debug output
        this.showDebug = this.serviceConfig.showDebug;
        const botList = []; // holder for the active bot which will get loaded 
        const servicesList = []; // holder for the active services while will get loaded
        
        // if plant bot enabled, load it
        if(this.serviceConfig.plantConfig.bot.enabled) {
            const PlantBot = require('./bots/plantBot');
            botList.push([PlantBot, this.serviceConfig.plantConfig.bot]);
        }
        
        // if senseHat bot enabled, load it
        if(this.serviceConfig.senseHatConfig.bot.enabled) {
            const SenseHatBot = require('./bots/senseHatBot');
            this.serviceConfig.senseHatConfig.bot['botName'] = this.serviceConfig.botName;
            botList.push([SenseHatBot, this.serviceConfig.senseHatConfig.bot]);
        }
        
        // if plant service is enabled, load it
        if(this.serviceConfig.plantConfig.service.enabled) {
            const PlantMonService = require('./services/plantMonService');
            servicesList.push([PlantMonService, this.serviceConfig.plantConfig.service]);
        }
        
        // if senseHat service is enabled, load it
        if(this.serviceConfig.senseHatConfig.service.enabled) {
            const SenseHatService = require('./services/senseHatService');
            servicesList.push([SenseHatService, this.serviceConfig.senseHatConfig.service]);
        }

        if (this.showDebug) {
            console.info('[main] config loaded');
        }
        // initialize the bots and services
        this.initialize(botList, servicesList);        
    }

    /**
     * utility method to handle processing arguments from the command line
     * arguments will be stored in this.args
     */
    processCommandLineArgs() {
        commandLineArgs.forEach((val, index, arr) => {
            if(val.indexOf('=') > 0) {
                const rowValue = val.split('=');
                this.args[rowValue[0]] = rowValue[1];
            }
        })
    }

    /**
     * main initialization method. This will start node, 
     * init an arduino connection, and startup any enabled bots and services.
     * @param {*} botList 
     * @param {*} servicesList 
     */
    initialize(botList, servicesList) {
        if (this.showDebug) {
            console.info('[main] initialize');
        }
        // start http server
        if (this.serviceConfig.httpEnabled) {
            this._httpServer = new httpServer(this.serviceConfig, this.showDebug);
            this._httpServer.startHttpServer(this);
        }

        // start ardunio connection
        if(this.serviceConfig.plantConfig.bot.enabled || this.serviceConfig.plantConfig.service.enabled) {
            this.arduino = new ArduinoBoard(false);
            this.arduino.startPort(this.serviceConfig.plantConfig.service.arduinoAddress, this.serviceConfig.plantConfig.service.baud);
        }
        
        if (servicesList) {
            for (const service of servicesList) {
                const serviceClass = service[0];
                const serviceConfig = service[1];
                this.servicesList.push(new serviceClass(serviceConfig, this._httpServer, this.showDebug, this.arduino));
            }
        }

        // create the bots and push to this.botList
        for (const startingBot of botList) {
            const botClass = startingBot[0];
            const botConfig = startingBot[1];
            this.botList.push(new botClass(botConfig, this.showDebug, this.arduino));
        }
        
        if (this.showDebug) {
            console.info(`[main] initialize and started ${this.botList.length} bots`);
        }

    }

    /**
     * utility method for looking up a loaded service
     * by the name of the bot the service is for
     * @param {*} botName 
     */
    findService(botName) {
        for (const service of this.servicesList) {
            if (service.config.botName === botName) {
                return service
            }
        }
        return null;
    }

    /**
     * utility method for looking up a loaded bot by name
     * @param {*} botName 
     */
    findBot(botName) {
        for (const bot of this.botList) {
            if (bot.config.botName === botName) {
                return bot
            }
        }
        return null;
    }

    /**
     * utility method to start a bot 
     * @param {*} botName 
     */
    startBot(botName) {
        const bot = this.findBot(botName);
        const service = this.findService(botName);
        this.toggleBot(bot, service, true);
    }

    /**
     * utility method to stop a bot 
     * @param {*} botName 
     */
    stopBot(botName) {
        const bot = this.findBot(botName);
        const service = this.findService(botName);
        this.toggleBot(bot, service, false);
    }

    /**
     * utility method to toggle a bot on/off. 
     * This can be called by the UI 
     * @param {*} botName 
     */
    toggleBot(bot, service, isEnabled) {
        if (bot) {
            bot.config.enabled = isEnabled;
            if (isEnabled) {
                bot.start();
            } else {
                bot.end();
            }
        }
        if (service) {
            service.config.enabled = isEnabled;
            if (isEnabled) {
                service.start();
            } else {
                service.stop();
            }
        }
    }

    /**
     * Main start method
     */
    start() {
        if (this.showDebug) {
            console.info('[main] start');
        }
        for (const service of this.servicesList) {
            // console.info(bot);
            service.start();
        }
        for (const bot of this.botList) {
            // console.info(bot);
            bot.start();
        }

    }

    /**
     * Main stop method
     */
    stop() {
        if (this.showDebug) {
            console.info('[main] stop');
        }
        for (const service of this.servicesList) {
            // console.info(bot);
            service.stop();
        }
        for (const bot of this.botList) {
            // console.info(bot);
            bot.stop();
        }

    }
}

// create Main and kick everything off by calling start()
const main = new Main();
main.start();

// if (process && process.stdin && process.stdin.setRawMode) {
//     const readline = require('readline');
//     readline.emitKeypressEvents(process.stdin);
//     process.stdin.setRawMode(true);
//     console.info('[Main] Ctrl+c or Ctrl+x to exit application.');
//     process.stdin.on('keypress', (str, key) => {
//         // console.log(`You pressed the "${key.name}" key`);
//         if (key.ctrl && (key.name === 'x' || key.name === 'c')) {
//             // main.stop();
//             console.info("[Main] shutting down");
//             // pythonProcess.stdin.write(`{"key":"stop"}\n`);
//             // pythonProcess.kill();
//             main.stop();
//             console.info('[Main] done');
//             setTimeout(() => {
//                 process.exit();
//             }, 10);
//         } else {
//             // main.tiltPan.process.writeMessage(`{"key":"${key.name}"}`);
//             console.log();
//             console.log('[Main] from node', key);
//             console.log();
//         }
//     });
// }