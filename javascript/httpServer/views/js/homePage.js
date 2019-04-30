class HomePage extends BasePage {
    constructor(parentDiv, routeName, botName) {
        super(parentDiv, routeName, botName);

        this.botsList = [];
        this.tweetList = [];
        this.retweetList = [];
        this.favoritesList = [];

        this.botsDiv = null;
        this.tweetsDiv = null;
        this.retweetsDiv = null;
        this.favoritesDiv = null;

    }

    start(aggregateUrl) {
        console.info('start page');

        this.botsDiv = document.createElement('div');
        this.botsDiv.id = 'botsContainer';
        this.botsDiv.className = 'container';
        this.botsDiv.innerHTML = this.loadingText('Bots');
        this.parentDiv.appendChild(this.botsDiv);

        this.tweetsDiv = document.createElement('div');
        this.tweetsDiv.id = 'tweetsContainer';
        this.tweetsDiv.className = 'container';
        this.tweetsDiv.innerHTML = this.loadingText('Tweets');
        this.parentDiv.appendChild(this.tweetsDiv);

        this.retweetsDiv = document.createElement('div');
        this.retweetsDiv.id = 'retweetsContainer';
        this.retweetsDiv.className = 'container';
        this.retweetsDiv.innerHTML = this.loadingText('Retweets');
        this.parentDiv.appendChild(this.retweetsDiv);

        this.favoritesDiv = document.createElement('div');
        this.favoritesDiv.id = 'favoritesContainer';
        this.favoritesDiv.className = 'container';
        this.favoritesDiv.innerHTML = this.loadingText('Favorites');
        this.parentDiv.appendChild(this.favoritesDiv);

        super.start(aggregateUrl);
    }

    refreshBotData() {
        this.fetchBotsListData()
            .then((results) => {
                console.info('[home] - bots -', results);
                if (results.data) {
                    this.botsList = results.data;

                    this.botsList = results.data;
                    const filteredList = [];
                    for (const listItem of this.botsList) {
                        filteredList.push({
                            'Bot Name': listItem.name,
                            'startupTimestamp': listItem.startupTimestamp,
                            'isEnabled': listItem.isEnabled,
                            'isTweeting': listItem.isTweeting,
                            'isRetweeting': listItem.isRetweeting,
                            'isFavoriting': listItem.isFavoriting,
                            'isTrackingFollowers': listItem.isTrackingFollowers
                        })
                    }

                    this.refreshList('Bots', this.botsDiv, filteredList);
                }
            });
    }

    refreshPageData() {
        this.refreshBotData();
        this.fetchTweetListData()
            .then((results) => {
                console.info('[home] - tweets -', results);
                if (results.data) {
                    this.tweetList = results.data;
                    this.refreshList('Tweets', this.tweetsDiv, this.tweetList);
                }
            });
        this.fetchRetweetListData()
            .then((results) => {
                console.info('[home] - retweets - ', results);
                if (results.data) {
                    this.retweetList = results.data;
                    this.refreshList('Retweets', this.retweetsDiv, this.retweetList);
                }
            })
        this.fetchFavoritesListData()
            .then((results) => {
                console.info('[home] - favorites - ', results);
                if (results.data) {
                    this.favoritesList = results.data;
                    this.refreshList('Favorites', this.favoritesDiv, this.favoritesList);
                }
            })

        super.refreshPageData();
    }

}