class BaseService {

    constructor(serviceConfig, httpServer, showDebug = false, arduino = null) {
        this.showDebug = showDebug;
        this.config = serviceConfig;
        this.pollingTimeout = null;
        this.server = httpServer;
        this.arduino = arduino;

        if (this.showDebug) {
            console.info(`[BaseService] constructed`);
        }
    }

    start() {
        if (this.showDebug) {
            console.info(`[BaseService] start`);
        }

        this.update();
    }

    stop() {
        if (this.showDebug) {
            console.info(`[BaseService] stop`);
        }

    }

    update() {
        if (this.showDebug) {
            console.info(`[BaseService] update`);
        }

        // setup next polling interval
        if (this.config.polling && this.config.polling.enabled && this.config.polling.enabled === true) {
            if (this.showDebug) {
                console.info(`[BaseService] set next interval in ${this.config.polling.interval}ms`);
            }
            this.pollingTimeout = setTimeout(this.update.bind(this), this.config.polling.interval);
        }

    }

}

module.exports = BaseService;