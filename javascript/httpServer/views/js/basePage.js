class BasePage {
    constructor(parent, routeName, aggregateUrl) {
        this._parent = parent;
        this._routeName = routeName;
        this._aggregateUrl = aggregateUrl;

        // Bot Menu
        this._limitBots = 8;
        this._boxBots = [];
        this._bots = {};
        this._menuBots = new swim.HtmlAppView(document.querySelector('#botMenu'))
            .append('div').className('botsContainer')
            .append('div').className('botBox container-fluid')
            .append('div').className('row boxRow');

        this._header = this._menuBots.append('div').className('col col-12 botHeader')
            .append('div').className('row');

        this._header.append('div').className('col col-6')
            .append('h2').text('Bot')

        this._countBots = this._header.append('div').className('col col-6')
            .text('(0)');

        for(let i = 0; i < this._limitBots; i++) {
            this._boxBots.push(new BoxBot(this._menuBots));
        }
    }

    start(aggregateUrl) {
        this._aggregateUrl = aggregateUrl;

        // this._aggregateUrl = 'ws://192.168.0.210:5620'; // Testing
        const nodeRef = swim.nodeRef(this._aggregateUrl, '/aggregate');

        nodeRef.downlinkMap().laneUri('join/robot')
            .didUpdate(this.addBots.bind(this)).open();
    }

    addBots(k, v) {
        const device = k.get('key').stringValue();
        let bot = this._bots[device];

        if(!bot) {
            let element = null;
            this._boxBots.forEach((box)=> {
                if(!box.device && !element) {
                    element = box;
                }
            });
            element.device = device;
            bot = this._bots[device] = element;
        }

        if(!bot.display) {
            bot.show();
        }

    }
}

class BoxBot {
    constructor(parent) {
        this._parent = parent;
        this._device = null;
        this._display = false;
        this._host = null;

        this._tempLink = null;
        this._presLink = null;
        this._humidityLink = null;
        this._botPlantLink = null;

        this._box = parent.append('div')
            .className('col col-12 col-md-6 box')

        this._square = this._box.append('div')
            .className('square');

        this._botContent = this._square.append('a')
            .className('botDiv')
            .opacity(0)
            .display('none');

        this._botContent.append('div').className('bubbles');
        this._botContent.append('div').className('status-icon');

        this._icon = this._botContent.append('div')
            .className('bot-icon');

        this._icon.append('picture')

        this._botName = this._icon.append('span')
            .text('--');

        this._plantName = this._botContent.append('div')
            .className('plant-name')
            .text('Idle');

        this._spec = this._botContent.append('ul')
            .className('info');

        this._temp = this._spec.append('li')
            .text('--°')

        this._pres = this._spec.append('li')
            .text('--mb')

        this._rh = this._spec.append('li')
            .text('--%')

    }

    connect() {
        if(!this._host) { return; }

        this._tempLink = swim.downlinkValue().hostUri(this._host).nodeUri('/sensor/temperature').laneUri('latest')
            .didSet((v)=> {
                this._temp.text(`${v.numberValue() || 0}°`);
            }).open();

        this._presLink = swim.downlinkValue().hostUri(this._host).nodeUri('/sensor/pressure').laneUri('latest')
            .didSet((v)=> {
                this._pres.text(`${v.numberValue() || 0}mb`);
            }).open();

        this._humidityLink = swim.downlinkValue().hostUri(this._host).nodeUri('/sensor/humidity').laneUri('latest')
            .didSet((v)=> {
                this._rh.text(`${v.numberValue() || 0}%`);
            }).open();

        this._botPlantLink = swim.downlinkValue().hostUri(this._host).nodeUri(`/bot/${this._device.split('|')[0]}`).laneUri('plantName')
            .didSet((v)=> {
                const name = v.stringValue();
                this._plantName.text(`${(name)? name : 'Idle'}`);
                this.watering( (name)? true : false );
            }).open();

        return this;
    }

    disconnect() {
        if(this._tempLink) { this._tempLink.close(); }
        if(this._presLink) { this._tempLink.close(); }
        if(this._humidityLink) { this._tempLink.close(); }
        return this;
    }

    get display() {
        return this._display;
    }

    get device() {
        return this._device;
    }

    set device(string) {
        const split = string.split('|');
        this._device = string;
        this._host = `ws://${split[1].split(':')[0]}:5620`;
        this._botName.text( `${split[0]}` );
        this.href( split[1] );
        this.connect();
    }

    watering(value) {
        (value)? this._botContent.addClass('watering') : this._botContent.removeClass('watering');
        return this;
    }

    href(string) {
        this._botContent.setAttribute('href',`//${string}/SenseHat`)
        return this;
    }

    plant(string) {
        this._plantName.text(`${string}`);
        return this;
    }

    show() {
        this._display = true;
        this._botContent.display('block')
            .opacity(1);
        return this;
    }

    hide() {
        this._display = false;
        this._botContent.display('none')
            .opacity(0);
        return this;
    }
}
