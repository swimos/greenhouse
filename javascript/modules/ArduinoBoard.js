const SerialPort = require('serialport');

/**
 * Simple utility used to communicate with an Arduino board over a serial connection
 */
class ArduinoBoard {
    /**
     * class constructor
     * @param {boolean} softwareDebugEnabled - (optional) disables communication on serial port 
     */
    constructor(softwareDebugEnabled = false) {
        this._softwareDebug = softwareDebugEnabled;
        this._port = null;
        this._dataHandler = null;
        if (!this._softwareDebug) {
            this._serialPort = require('serialport');
            this._readline = this._serialPort.parsers.Readline;
            this._parser = new this._readline();
        }
    }

    /**
     * 
     * @param {string} serialAddress - address of serial port for the board
     * @param {number} baud - baud rate to communicate at. Make sure this matches what the scripts on the arduino are communicating at.
     */
    startPort(serialAddress = '/dev/ttyACM0', baud = 9600) {
        if (!this._softwareDebug) {
            try {
                console.info(`Open arduino on ${serialAddress}`);
                this._port = new this._serialPort(serialAddress, {
                    baudRate: baud
                });
                this._port.pipe(this._parser);

                this._port.on('open', this.onConnectionOpened.bind(this));
                this._port.on('error', this.onError.bind(this));
                this._parser.on('data', this.onData.bind(this));
            } catch (err) {
                console.log(err);
            }
        }
    }

    /**
     * write a message to the arduino over serial port
     * @param {string} msg 
     */
    writeMessage(msg) {
        try {
            this._port.write(msg);
        } catch (err) {
            console.log(err);
        }
    }

    /**
     * set the function which will handle message events from serial port
     * this is the hook for grabbing messages from the arduino
     * @param {function} handler 
     */
    setDataHandler(handler) {
        this._dataHandler = handler;
    }

    /**
     * event handler for receiving data over the serial port
     * @param {string} data 
     */
    onData(data) {
        if (typeof this._dataHandler === 'function') {
            this._dataHandler(data);
        }
    }

    /**
     * Event handler for when serial connection is opened
     * @param {string} msg 
     */
    onConnectionOpened(msg) {
        console.log('Arduino connection opened.');
    }

    /**
     * Event Handler for when there is an error on the serial port
     * @param {string} err 
     */
    onError(err) {
        console.log('Arduino connection error:', err.message);
    }

}

module.exports = ArduinoBoard;
