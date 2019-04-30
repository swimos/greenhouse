const HttpConfig = {
	httpEnabled: true,
	showDebug: false,
	botName: 'CloudZones',
	hostUrl: 'plantMon.swim.ai',
	aggregateHost: 'plantMon.swim.ai',
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
			enabled: false,
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
			enabled: false,
			arduinoAddress: '/dev/ttyUSB0',
			baud: 115200,
			polling: {
				enabled: true,
				interval: 100
			}
		}
	}
}


module.exports = HttpConfig;
