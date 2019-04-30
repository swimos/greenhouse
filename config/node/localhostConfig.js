const HttpConfig = {
	httpEnabled: true,
	showDebug: true,
	hostUrl: '127.0.0.1',
	aggregateHost: '127.0.0.1',
	hostPort: 8080,
	swimPort: 5620,
	botName: 'RaspiPlantAggBotLocal',
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
			enabled: false,
			consumer_key: '',
			consumer_secret: '',
			access_token: '',
			access_token_secret: '',
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
			enabled: false,
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
