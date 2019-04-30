const BaseService = require('./baseService');

class PlantMonService extends BaseService {

    constructor(serviceConfig, httpServer, showDebug = false, arduino = null) {
        super(serviceConfig, httpServer, showDebug);
        this.arduino = arduino;

        this.dataValueCache = {};

        this.pollingUpdateEnabled = true;
        this.pollingIntervalMS = 300;
        this.pollingInterval = null;
            
    }

    start() {
        // super.start();
        if (this.showDebug) {
            console.info(`[PlantMonService] start baud${this.config.baud}`);
        }
        if(this.ardunio !== null) {
            this.arduino.setDataHandler(this.onSerialData.bind(this));
            // this.arduino.startPort(this.config.baud);
        } else {
            console.error('arduino is null')
        }

        if(this.pollingUpdateEnabled) {
            this.pollingInterval = setInterval(() => {
                this.updateSwim();
            }, this.pollingIntervalMS);
        }
    }

    updateSwim() {
        // console.info(this.dataValueCache);
        if(Object.keys(this.dataValueCache).length > 0) {
            this.server.sendSensorDataCommand('plantUpdate', this.dataValueCache);
        }
    }


    onSerialData(newData) {
        try {
            const sensorData = JSON.parse(newData);
            if (this.showDebug) {
                console.info('[PlantMonService]', sensorData);
            }
            const updateData = {};

            for(const dataItem in sensorData) {
                let sendUpdate = false;
                if(!this.dataValueCache[dataItem] && this.dataValueCache[dataItem] !== 0) {
                    sendUpdate = true;
                } else {
                    if(this.dataValueCache[dataItem] !== sensorData[dataItem]) {
                        sendUpdate = true;
                    }
                }
                if(sendUpdate) {
                    this.dataValueCache[dataItem] = sensorData[dataItem];
                    updateData[dataItem] = this.dataValueCache[dataItem];
                }
            }            
            if(!this.pollingUpdateEnabled) {
                // console.info(updateData);
                if(Object.keys(updateData).length > 0) {
                	this.server.sendSensorDataCommand('plantUpdate', updateData);
                }
            }
        } catch (err) {
            // console.info(err);
        }

    }

    stop() {
        if (this.showDebug) {
            console.info(`[PlantMonService] stop`);
        }
        super.stop();
    }

    update() {
        if (this.showDebug) {
            console.info(`[PlantMonService] update`);
        }
        super.update();
    }

}

module.exports = PlantMonService;
