const HttpConfig = {
	httpEnabled: true,
	showDebug: false,
	botName: 'RaspiBot5',
	hostUrl: '192.168.1.96',
	aggregateHost: '192.168.1.71',
	hostPort: 8080,
	swimPort: 9001,
	senseHatConfig: {
		bot: {
			enabled: true,
		},
		service: {
			enabled: true,
			polling: {
				enabled: true,
				interval: 100
			}			
		}
	},
	plantConfig: {
		bot: {
			enabled: true,
			updateInterval: {
				enabled: false,
				intervalTimeout: 1000, // in milliseconds
			}
		},
		service: {
			enabled: true,
			arduinoAddress: '/dev/ttyACM0',
			baud: 115200,
			polling: {
				enabled: true,
				interval: 100
			}
		}
	}
}

module.exports = HttpConfig;
