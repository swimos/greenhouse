// include base class
const BaseBot = require('./baseBot');

// include SWIM client
const swim = require('@swim/client');

/**
 * The PlantBot handles acting upon the sensor data fed into 
 * SWIM from the plantMonService
 */
class PlantBot extends BaseBot {

    /**
     * Class constructor
     * @param {object} botConfig - bot configuration loaded from config file
     * @param {boolean} showDebug - toggle debug output
     * @param {object} arduino - an instance of a ArdiunoBoard class used for sending messages to the board
     */
    constructor(botConfig, showDebug = false, arduino) {
        super(botConfig, showDebug);
        this.lastUpdateTimestamp = null;
        this.lastMoistureValue = null;
        this.lastLightValue = null;
        this.lightThresholdValue = -1;
        this.isLightOn = false;
        this.arduino = arduino;
        this.updateInterval = null;

        // open a Value downlink to SWIM light sensor service 'latest' value lane
        this.lightSensorValueLane = swim.downlinkValue()
            .hostUri(`ws://127.0.0.1:9001`)
            .nodeUri('/sensor/light')
            .laneUri('latest')
            .didSet((newValue) => {
                this.lastLightValue = newValue
            });

        // open a Value downlink to SWIM light sensor service 'threshold' value lane
        this.lightThresholdValueLane = swim.downlinkValue()
            .hostUri(`ws://127.0.0.1:9001`)
            .nodeUri('/sensor/light')
            .laneUri('threshold')
            .didSet((newValue) => {
                this.lightThresholdValue = newValue
            });

        if (this.showDebug) {
            console.info(`[PlantBot] constructed`);
        }
    }

    /**
     * start the plant bot
     */
    start() {
        super.start();
        if (this.showDebug) {
            console.info(`[PlantBot] start ${this.config.updateInterval.intervalTimeout}`);
        }
        // open SWIM value downlinks
        this.lightSensorValueLane.open();
        this.lightThresholdValueLane.open();

        // create update interval if enabled
        if(this.config.updateInterval.enabled) {
            this.updateInterval = setInterval( this.update.bind(this), this.config.updateInterval.intervalTimeout);
        }
    }

    /**
     * handle interval update. 
     */
    update() {
        if (this.showDebug) {
            console.info(`[PlantBot] update`);
            console.info(`light ${this.lastLightValue} <= ${this.lightThresholdValue}`);
        }
        
        // Read current Value downlinks and decides if a grow light should be on
        if(this.lastLightValue <= this.lightThresholdValue) {
            if(!this.isLightOn) {
                if (this.showDebug) {
                    console.info('turn on light');
                }
                this.arduino.writeMessage('lightOn');
                this.isLightOn = true;
            }
        } else {
            if(this.isLightOn) {
                if (this.showDebug) {
                    console.info('turn off light');
                }
                this.arduino.writeMessage('lightOff');
                this.isLightOn = false;
            }
        }
    }
}

module.exports = PlantBot;