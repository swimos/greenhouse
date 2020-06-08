const HttpConfig = {
	httpEnabled: true,
	showDebug: false,
	hostUrl: '127.0.0.1',
	aggregateHost: '127.0.0.1',
	hostPort: 8080,
	swimPort: 9001,
	botName: 'RaspiAggPlantBotLocal',
	senseHatConfig: {
		bot: {
			enabled: false,
		},
		service: {
			enabled: false,
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
			arduinoAddress: '/dev/ttyS4',
			baud: 115200,
			polling: {
				enabled: true,
				interval: 100
			}
		}
	}
}

module.exports = HttpConfig;
