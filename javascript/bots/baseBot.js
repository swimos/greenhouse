/**
 * Base class for a system 'Bot'
 * The sole purpose of a 'bot' in this context is to monitor data from 
 * various sources and act on the data. Generally Bots are read only. A bot
 * can do various things such as signaling arduinos, posting tweets, or updating 
 */
class BaseBot {

    constructor(botConfig, showDebug = false, arduino = null, swimUrl = "127.0.0.1") {
        this.showDebug = showDebug;
        this.config = botConfig;
        this.arduino = arduino;
        this.swimUrl = swimUrl;

        if (this.showDebug) {
            console.info(`[BaseBot] constructed`);
        }


    }

    /**
     * called to start the bot
     */
    start() {
        if (this.config.enabled) {
            if (this.showDebug) {
                console.info(`[BaseBot] start`);
            }

        }

    }

    /**
     * called to stop the bot
     */
    stop() {
        if (this.showDebug) {
            console.info(`[BaseBot] end`);
        }
    }

}

module.exports = BaseBot;