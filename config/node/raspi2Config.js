const HttpConfig = {
	httpEnabled: true,
	showDebug: false,
	botName: 'RaspiPlant2',
	hostUrl: '75.50.82.129',
	aggregateHost: '192.168.1.92',
	hostPort: 8080,
	swimPort: 5620,
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
			consumer_key: '', 
			consumer_secret: '',
			access_token: '',
			access_token_secret: '',
			updateInterval: {
				enabled: true,
				intervalTimeout: 1000, // in milliseconds
			},
			randomTweet: {
				enabled: false,
				intervalTimeout: 1000 * 120, // in milliseconds
			},
			trackFollowers: {
				enabled: false,
				intervalTimeout: 1000 * 60 * 120, // in milliseconds
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
