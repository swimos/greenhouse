const express = require('express');
const http = require('http').Server(express);
const path = require('path');
const expressHandlebars = require('express-handlebars');
const swim = require('@swim/client');
// const swim = new client.Client({sendBufferSize: 1024*1024});

class HttpServer {
    constructor(httpConfig, db, showDebug = false) {
        this.config = httpConfig;
        this.port = this.config.hostPort;
        this.botName = this.config.botName;
        this.server = null;
        this.webApp = null;
        this.showDebug = showDebug;
        this.hbsHelpers = null;
        this.wikiQuote = null;
        this.main = null;
		this.hostUrl = this.config.hostUrl;
		this.swimPort = this.config.swimPort;
		this.fullHostUrl = 'http://' + this.hostUrl + ((this.port !== 80) ? (':' + this.port) : '');
        this.fullSwimUrl = 'ws://' + this.hostUrl + ':' + this.swimPort;
        this.fullAggUrl = 'http://' + this.config.aggregateHost + ((this.port !== 80) ? (':' + this.port) : '');
        this.fullAggSwimUrl = 'ws://' + this.config.aggregateHost + ':5620';
        this.isPlantMon = this.config.isPlantMon;
        this.isSenseHat = this.config.isSenseHat;
        this.isAggregator = this.config.isAggregator;


	console.info('create http server @' + this.fullHostUrl);
        this.botList = [];
    }

    /**
     * start up http server and setup express
     */
    setUpEngine() {

        // initialized ExpressJS
        this.webApp = express();
        this.webApp.engine('.hbs', expressHandlebars({
            defaultLayout: 'main',
            extname: '.hbs',
            layoutsDir: path.join(__dirname, 'views/layouts')
        }));
        this.webApp.set('view engine', '.hbs');
        this.webApp.set('views', path.join(__dirname, 'views'));
        this.webApp.use('/js', express.static(path.join(__dirname + '/views/js')));
        this.webApp.use('/css', express.static(path.join(__dirname + '/views/css')));
        this.webApp.use('/assets', express.static(path.join(__dirname + '/views/assets')));

        // define our webserver
        this.server = require('http').Server(this.webApp);

        // create our handlebars helpers
        this.hbsHelpers = {
            'if_eq': (a, b, opts) => {
                if (a == b) {
                    return opts.fn(this);
                } else {
                    return opts.inverse(this);
                }
            },
            'if_not_eq': (a, b, opts) => {
                if (a != b) {
                    return opts.fn(this);
                } else {
                    return opts.inverse(this);
                }
            },
        };

    }

    /**
     * this posts key value pair to a specified sensor lane as a command to swim 
     */
    sendSensorDataCommand(messageKey, messageData) {
        
        for(const dataKey in messageData) {
            // console.info(this.fullSwimUrl, `/sensor/${dataKey}`, `addLatest`, messageData[dataKey]);
            swim.command(this.fullSwimUrl, `/sensor/${dataKey}`, `addLatest`, messageData[dataKey]);
        }
    }

    /**
     * server error handler
     * @param  {[Object]} err [message object]
     */
    onServerStarted(err) {
        if (err) {
            console.error('[httpServer] startup error', err);
        }
        if (this.showDebug) {
            console.info(`[httpServer] express server listening on ${this.port}`);
        }

    }

    /**
     * utility method which creates all the page routes to be used by ExpressJS
     */
    createPageRoutes() {
        // home page route
        this.webApp.get('/', (request, response) => {
            response.render('homePage', {
                routeName: 'home',
                botName: this.botName,
				fullHostUrl: this.fullHostUrl,
                fullSwimUrl: this.fullSwimUrl,
                aggregateHostUrl: this.fullAggUrl,
                aggregateSwimUrl: this.fullAggSwimUrl,
                isAggregator: this.isAggregator,
                isPlantMon: this.isPlantMon,
                isSenseHat: this.isSenseHat,
                helpers: this.hbsHelpers
            })                
        
        })

        // plant monitor page route
        this.webApp.route('/plantMon')
            .get((request, response) => {
                const reqParams = request.params;

                response.render('plantMon', {
                    routeName: 'plant',
                    botName: this.botName,
					fullHostUrl: this.fullHostUrl,
					fullSwimUrl: this.fullSwimUrl,
                    aggregateHostUrl: this.fullAggUrl,
                    aggregateSwimUrl: this.fullAggSwimUrl,
                    isAggregator: this.isAggregator,
                    isPlantMon: this.isPlantMon,
                    isSenseHat: this.isSenseHat,
                    helpers: this.hbsHelpers
                })
            })

        // senseHat monitor page (a.k.a. bot page)
        this.webApp.route('/senseHat')
            .get((request, response) => {
                const reqParams = request.params;
                const plantId = reqParams.plantId;

                response.render('senseHat', {
                    routeName: 'senseHat',
                    botName: this.botName,
					fullHostUrl: this.fullHostUrl,
                    fullSwimUrl: this.fullSwimUrl,
                    aggregateHostUrl: this.fullAggUrl,
                    aggregateSwimUrl: this.fullAggSwimUrl,
                    isAggregator: this.isAggregator,
                    isPlantMon: this.isPlantMon,
                    isSenseHat: this.isSenseHat,
                    helpers: this.hbsHelpers
                })
            })

        // main view aggregate page
        this.webApp.route('/aggregate')
            .get((request, response) => {
                const reqParams = request.params;
                const plantId = reqParams.plantId;

                response.render('aggregatePage', {
                    routeName: 'aggregator',
                    botName: this.botName,
					fullHostUrl: this.fullHostUrl,
                    fullSwimUrl: this.fullSwimUrl,
                    aggregateHostUrl: this.fullAggUrl,
                    aggregateSwimUrl: this.fullAggSwimUrl,
                    isAggregator: this.isAggregator,
                    isPlantMon: this.isPlantMon,
                    isSenseHat: this.isSenseHat,
                    helpers: this.hbsHelpers
                })
            })

        // aggregate status monitor page.
        this.webApp.route('/monitor')
            .get((request, response) => {
                const reqParams = request.params;
                const plantId = reqParams.plantId;

                response.render('monitor', {
                    routeName: 'monitor',
                    botName: this.botName,
                    fullHostUrl: this.fullHostUrl,
                    fullSwimUrl: this.fullSwimUrl,
                    aggregateHostUrl: this.fullAggUrl,
                    aggregateSwimUrl: this.fullAggSwimUrl,
                    isAggregator: this.isAggregator,
                    isPlantMon: this.isPlantMon,
                    isSenseHat: this.isSenseHat,
                    helpers: this.hbsHelpers
                })
            })

        // zones page route    
        this.webApp.route('/zones')
            .get((request, response) => {
                const reqParams = request.params;
                const plantId = reqParams.plantId;

                response.render('zonesPage', {
                    routeName: 'zones',
                    botName: this.botName,
                    fullHostUrl: this.fullHostUrl,
                    fullSwimUrl: this.fullSwimUrl,
                    aggregateHostUrl: this.fullAggUrl,
                    aggregateSwimUrl: this.fullAggSwimUrl,
                    isAggregator: this.isAggregator,
                    isPlantMon: this.isPlantMon,
                    isSenseHat: this.isSenseHat,
                    helpers: this.hbsHelpers
                })
            })

    }

    /**
     * startup http server
     */
    startHttpServer(mainThread) {
        this.main = mainThread;
        this.setUpEngine();
		this.createPageRoutes();

        this.server.listen(this.port, this.onServerStarted.bind(this));

    }


}

module.exports = HttpServer;
