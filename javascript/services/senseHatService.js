const BaseService = require('./baseService');
const PythonWrapper = require('../modules/pythonWrapper');

class SenseHatService extends BaseService {


    constructor(serviceConfig, httpServer, showDebug = false, arduino = null) {
        super(serviceConfig, httpServer, showDebug);
        this.joystickState = 'none';
        this.joystick = null;
        this.dataValueCache = {};

        this.pollingUpdateEnabled = false;
        this.pollingIntervalMS = 100;
        this.pollingInterval = null;

        this.envBridge = new PythonWrapper('./../hardware/envSensorBridge.py', this.showDebug, this.swimUrl);
        this.imuBridge = new PythonWrapper('./../hardware/imuSensorBridge.py', this.showDebug, this.swimUrl);
        this.joystickBridge = new PythonWrapper('./../hardware/joystickBridge.py', this.showDebug, this.swimUrl);

        // console.info(this.envBridge);
            
    }

    start() {
        super.start();
        if (this.showDebug) {
            console.info(`[SenseHatService] start`);
        }

        this.envBridge.start();
        this.imuBridge.start();
        this.joystickBridge.start();
    }

    stop() {
        if (this.showDebug) {
            console.info(`[SenseHatService] stop`);
        }
        this.envBridge.stop();
        this.imuBridge.stop();
        this.joystickBridge.stop();
        super.stop();
    }

}

module.exports = SenseHatService;
