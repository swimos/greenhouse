// include base class
const BaseBot = require('./baseBot');
// include swim client
const swim = require('@swim/client');
// include lib for talking with SenseHat (https://github.com/aonghusonia/sense-hat-led)
// const sense = require("sense-hat-led");
// // include libraries for talking to SenseHat joystick
// const nodeimu = require('nodeimu');
// const IMU = new nodeimu.IMU();
// const senseJoystick = require('sense-joystick');
const PythonWrapper = require('../modules/pythonWrapper');

/**
 * The SenseHatBot acts as a 'Bot' within the network and 
 * is responsible for updating the animation 
 * on LED screen for the SenseHat itself based on the state of the bot. 
 * It reads from a SWIM downlink to update the background of 
 * the animation based on the bot has been assigned a task from its aggregator.
 */
class SenseHatBot extends BaseBot {

    /**
     * Class constructor
     * @param {object} botConfig - bot configuration loaded from config file
     * @param {boolean} showDebug - toggle debug output
     */
    constructor(botConfig, showDebug = false) {
        super(botConfig, showDebug);

        this.botName = botConfig.botName;
        this.showDebug = showDebug;

        //placeholders for managing how we update the LEDs
        this.pixelRowIndex = 2;
        this.pixelColumnIndex = 0;
        this.scanRight = true;
        this.lastColumnScanned = 0;
        this.logoColIndex = 0;
        this.animationIntervalMS = 50;
        this.animationInterval = null;
        this.showingMessage = false;
        this.logoScrollSpeed = 1;

        // define some colors we can use on the screen
        this.red = [200, 0, 0];
        this.redDark = [50, 0, 0];
        this.green = [0, 200, 0];
        this.greenDark = [0, 50, 0];
        this.blue = [0, 0, 172];
        this.blueDark = [0, 0, 50];
        this.black = [0, 0, 0];
        this.white = [255, 255, 255];

        //define values for sensehat joystick
        this.joystickState = 'none';
        this.joystickDirection = 'none';
        this.lastJoystickState = null;
        this.joystick = null;
        this.joystickMap = {
            none: 0,
            left: 1,
            right: 2,
            up: 3,
            down: 4,
            click: 5
        }

        // define an arry of bit values which make up a small SWIM logo
        this.swimLogo = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];

        // define bits which make up a large SWIM logo
        this.swimLogoLarge = [
            [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
            [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
        ];

        // define which logo to use (or null for no logo)
        this.activeLogo = this.swimLogoLarge;

        // create and open a SWIM Value downlink to monitor the 'status' lane of the bot
        this.valueDownlink = swim.downlinkValue().hostUri('ws://127.0.0.1:5620')
        this.botStatusLane = this.valueDownlink.nodeUri(`/bot/${this.botName}`).laneUri('status')
            .didSet((msg) => {
                if (this.showDebug) {
                    console.info(`[SenseHatBot] status msg`, msg);
                }
                this.botStatus = msg.value
            });
        this.botStatus = false;

        this.joystickStatusLane = this.valueDownlink.nodeUri(`/device`).laneUri('joystickState')
            .didSet((msg) => {
                if (this.showDebug) {
                    console.info(`[SenseHatBot] joystick state msg`, msg);
                }
                this.joystickState = msg.value
            });

        this.joystickDirectionLane = this.valueDownlink.nodeUri(`/device`).laneUri('joystickDirection')
            .didSet((msg) => {
                if (this.showDebug) {
                    console.info(`[SenseHatBot] joystick direction msg`, msg);
                }
                this.joystickDirection = msg.value
            });

        this.ledBridge = new PythonWrapper('./../hardware/ledMatrixBridge.py', this.showDebug);

        if (this.showDebug) {
            console.info(`[SenseHatBot] constructed`);
        }
    }

    /**
     * startup sensehat bot
     */
    start() {
        if (this.showDebug) {
            console.info(`[SenseHatBot] start`);
        }

        // open status downlink
        this.botStatusLane.open();
        this.joystickStatusLane.open();
        this.joystickDirectionLane.open();
        this.ledBridge.start();

        // // get sensehat joystick state and save it.
        // senseJoystick.getJoystick()
        //     .then((joystick) => {

        //         joystick.on('press', (direction) => {
        //             this.joystickState = direction;
        //         });
        //         joystick.on('hold', (direction) => {
        //             this.joystickState = direction;
        //         });
        //         joystick.on('release', (direction) => {
        //             this.joystickState = 'none';
        //         });
        //     });

        // if (this.showDebug) {
        //     console.info(`[SenseHatBot] joystick: ${this.joystickState}`);
        // }

        // if no active logo, show a test pattern
        if (this.activeLogo === null) {
            // sense.clear();
            this.clear();
            for (let i = 0; i <= 7; i = i + 1) {
                this.setPixel(i, 0, this.black);
                this.setPixel(i, 1, this.blueDark);
                this.setPixel(i, 2, this.blue);
                this.setPixel(i, 5, this.blue);
                this.setPixel(i, 6, this.blueDark);
                this.setPixel(i, 7, this.black);
            }
        } else {
            // draw the logo to the screen starting at the first column of values in the logo
            this.clear();

            for (let y = 0; y <= 7; y = y + 1) {
                for (let x = 0; x <= 7; x = x + 1) {
                    this.setPixel(x, y, (this.activeLogo[y][x + this.logoColIndex] === 0 ? this.blue : this.white));
                }
            }
        }

        // set the screen animation update interval
        this.animationInterval = setInterval(() => {
            this.updateScreen();
        }, this.animationIntervalMS);
    }

    stop() {
        this.ledBridge.stop();
        super.stop();
    }

    clear() {
        this.ledBridge.writeMessage("{'key':'clear'}")
    }

    setPixel(pixelX, pixelY, colorArr) {
        const jsonMsg = {
            key: 'setPixel',
            x: pixelX,
            y: pixelY,
            r: colorArr[0],
            g: colorArr[1],
            b: colorArr[2]
        }
        this.ledBridge.writeMessage(JSON.stringify(jsonMsg));
    }

    showMessage(message, scrollSpeed = 0.1, textColorArr = [255,255,255], backgroundColorArr = [0,0,0]) {
        const jsonMsg = {
            msg: message,
            speed: scrollSpeed,
            textColor: textColorArr,
            backgroundColor: backgroundColorArr
        }
        this.ledBridge.writeMessage(JSON.stringify(jsonMsg));
    }

    /**
     * read value downlinks and update the screen animation
     */
    updateScreen() {
        if (this.showDebug) {
            // console.info(`[SenseHatBot] updateScreen`);
        }


        if (this.scanRight) {
            this.pixelColumnIndex = this.pixelColumnIndex + 1;
            if (this.pixelColumnIndex > 7) {
                this.pixelColumnIndex = 6;
                this.scanRight = false;
            }
        } else {
            this.pixelColumnIndex = this.pixelColumnIndex - 1;
            if (this.pixelColumnIndex < 0) {
                this.pixelColumnIndex = 1;
                this.scanRight = true;
            }

        }

        //if there is no active logo, show the test cylon scanner animation
        if ((!this.activeLogo || this.activeLogo === null) && this.joystickState === 'none') {
            if (!this.showingMessage) {
                this.clear();
                for (let i = 0; i <= 7; i = i + 1) {
                    this.setPixel(i, 0, this.black);
                    this.setPixel(i, 1, this.blueDark);
                    this.setPixel(i, 2, this.blue);
                    this.setPixel(i, 3, this.black);
                    this.setPixel(i, 4, this.black);
                    this.setPixel(i, 5, this.blue);
                    this.setPixel(i, 6, this.blueDark);
                    this.setPixel(i, 7, this.black);
                }
                this.setPixel(this.lastColumnScanned, this.pixelRowIndex + 1, (this.joystickState === 'none') ? this.greenDark : this.redDark);
                this.setPixel(this.lastColumnScanned, this.pixelRowIndex + 2, (this.joystickState === 'none') ? this.greenDark : this.redDark);
                this.setPixel(this.pixelColumnIndex, this.pixelRowIndex + 1, (this.joystickState === 'none') ? this.green : this.red);
                this.setPixel(this.pixelColumnIndex, this.pixelRowIndex + 2, (this.joystickState === 'none') ? this.green : this.red);

                this.lastColumnScanned = this.pixelColumnIndex;
            }
        // if there is no active logo but the joy stick is changed, display the joystick state
        } else if ((!this.activeLogo || this.activeLogo === null) && this.joystickState !== 'none') {
            if (this.showDebug) {
                console.info(`[SenseHatBot] joystick: ${this.joystickState}`);
            }
            if (this.lastJoystickState !== this.joystickState && !this.showingMessage) {
                const msgComplete = () => {
                    this.showingMessage = false;
                }
                this.showMessage(this.joystickState, 0.1, ((this.botStatus === 'WORKING') ? this.red : this.blue), this.black);
                this.lastJoystickState = this.joystickState;
                this.showingMessage = true;
            }

        // if activeLogo is defined, handle animating it
        } else {
            if (!this.showingMessage && this.activeLogo) {
                if (this.lastJoystickState !== this.joystickState) {
                    // check joystick to change scroll speed
                    if (this.joystickDirection === "right") {
                        this.logoScrollSpeed++;
                    }
                    if (this.joystickDirection === "left") {
                        this.logoScrollSpeed--;
                    }
                    if (this.joystickDirection === "middle") {
                        this.logoScrollSpeed = 1;
                        // if (this.activeLogo === this.swimLogoLarge) {
                        //     this.activeLogo = this.swimLogo
                        // } else if (this.activeLogo === this.swimLogo) {
                        //     this.activeLogo = null;
                        // } else {
                        //     this.activeLogo = this.swimLogoLarge;
                        // }
                        this.activeLogo = (this.activeLogo === this.swimLogoLarge) ? this.swimLogo : this.swimLogoLarge;
                    }
                }
                if (this.logoColIndex < 0) {
                    this.logoColIndex = this.activeLogo[0].length-1;
                }

                // update the screen
                this.logoColIndex = this.logoColIndex + this.logoScrollSpeed;
                for (let y = 0; y <= 7; y = y + 1) {
                    for (let x = 0; x <= 7; x = x + 1) {
                        let newX = x + this.logoColIndex;
                        if(this.activeLogo) {
                            if (newX >= this.activeLogo[y].length) {
                                newX = newX - this.activeLogo[y].length
                            }
                            this.setPixel(x, y, (this.activeLogo[y][newX] === 0 ? ((this.botStatus === 'WORKING') ? this.red : this.blue) : this.white));
                        }
                    }
                }

                // reset column index if out of bounds
                if (this.activeLogo && this.logoColIndex >= this.activeLogo[0].length) {
                    this.logoColIndex = 0;
                } else if(!this.activeLogo || this.activeLogo === null) {
                    this.logoColIndex = 0;
                }
            }
        }
        this.lastJoystickState = this.joystickState;
    }
}

module.exports = SenseHatBot;