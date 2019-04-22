/**
 * Init class for plant page
 */
class PlantPage extends BasePage {
    constructor(parentDiv, routeName) {
        super(parentDiv, routeName);
        this.parentDiv = parentDiv;
        this.frameIntervalMS = 200;
        this.swimUrl = 'ws://127.0.0.1:5620' // Fallback local service
        this._alertStats = 0;
    }

    /**
     * Store url variable, this url is to connect to websocket
     * @param {string} url
     */
    setSwimURL(newUrl) {
        this.swimUrl = newUrl;
    }

    get alertStats() {
        return this._alertStats;
    }

    /**
     * Initialize range input function
     * @param {string} url
     */
    start(aggregateUrl) {
        super.start(aggregateUrl);

        //this.swimUrl = 'ws://192.168.0.212:5620'; // Testing

        new Graphic(this.swimUrl, 'light', 'lx', '#fee54e');
        new Graphic(this.swimUrl, 'soil', '%', '#4bc8ff');
        new Graphic(this.swimUrl, 'temperatureCh1', '°', '#ff904e');

        this._rangeLight = new PlantRange(this, this.parentDiv, 'light');
        this._rangeSoil = new PlantRange(this, this.parentDiv, 'soil');
        this._rangeTemp = new PlantRange(this, this.parentDiv, 'temperatureCh1');

        // Connect to swim service and check for value
        const alertOpenValue = swim.downlinkValue().hostUri(this.swimUrl).nodeUri('/sensor/light').laneUri('option')
            .didSet(this.onAlertOpen.bind(this))
            .open();
    }


    /**
     * Check if the range inpput wrapper to show or not. Applying the wrapper with class
     * @param {number} value between 0-1
     */
     onAlertOpen(v) {
        const className = 'alert-setting';
        this._alertStats = v.numberValue();

        if (this._alertStats === 1) {
            this.parentDiv.classList.add(className)
            this._rangeLight.rangeResize();
            this._rangeSoil.rangeResize();
            this._rangeTemp.rangeResize();
        } else {
            this.parentDiv.classList.remove(className);
        }
    }

    /**
     * Refresh page
     */
    refreshPage() {
        super.refreshPage();
    }

    /**
     * Refresh data
     */
    refreshData() {
        super.refreshData();
        this.refreshPage();
    }
}

/**
 * Cutom plant input field function for rannge sending data to swim services
 */
class PlantRange {
    constructor(parent, parentView, type) {
        this._parent = parent;
        this.parentView = parentView;
        this.boxView = document.querySelector(`.box-${type}`);
        this._type = type;
        this.rangeClick = false;
        this.barInterval = null;
        this._nodeRef = swim.nodeRef(this._parent.swimUrl, `sensor/${type}`);

        this.iconAlert = this.boxView.querySelector('.alert-wrap');
        this.iconAlertValue = this.iconAlert.querySelector('.value');

        this.iconAlert.addEventListener("click", this.onAlertClick.bind(this))

        // Connect to swim service and check for value
        const alertValue = this._nodeRef.downlinkValue().laneUri('alert')
            .didSet(this.onAlertChange.bind(this))
            .open();

        this.inputRange = this.boxView.querySelector('.input-range');
        this.inputRange.addEventListener('mouseup', this.onRangeMouseup.bind(this));
        this.inputRange.addEventListener('input',  this.onRangeMousedown.bind(this));

        // Connect to swim service and check for value
        const inputValue = this._nodeRef.downlinkValue().laneUri('threshold')
            .didSet(this.onValueChange.bind(this))
            .open();

        this.rangeWrap = this.boxView.querySelector('.range-wrap');
        this.rangeMeter = this.boxView.querySelector('.range-wrap .meter');

        window.addEventListener('resize', this.rangeResize.bind(this));
        this.rangeResize();
    }

    /**
     * Dynamic height for range when range is vertical.
     * Was not able to do this in css.
     */
    rangeResize() {
        const height = this.rangeWrap.offsetHeight;
        this.inputRange.style.width = `${height + 20}px`;
    }

    /**
     * Clicl event that send {0,1} to siwm service for alert
     */
    onAlertClick() {
        const value = (this._parent.alertStats === 0)? 1 : 0;
        this.updateOption(value);
    }

    /**
     * Check if there is an alert and apply class to parent view
     * @stylesheeet .alert-box-{tyoe}
     * @param {boolean}
     */
    onAlertChange(value) {
        (value.stringValue() === 'true')? this.parentView.classList.add(`alert-box-${this._type}`) : this.parentView.classList.remove(`alert-box-${this._type}`);
    }

    /**
     * Change range input base on incoming value
     * @param {number} range current state
     */
    onValueChange(value) {
        value = value.numberValue() || 0; // fallback if value is undefined
        if(!this.rangeClick) {
            this.inputRange.value = value;
            this.onRangeBarChange(value);
        }
    }

    /**
     * Mouse down on range input,send the value to swim service
     */
    onRangeMousedown() {
        this.rangeClick = true;
        this.value = this.inputRange.value;
        this.onRangeBarChange(this.inputRange.value);
        this.updateThreshold(this.inputRange.value);
    }

    /**
     * Mouse up on range input, set click false
     */
    onRangeMouseup() {
        // set timeout is to prevent on value change to prevent input jumping
        // We already set the new value no need to tigger onValueChange again. and prevent spaming
        setTimeout(() => {
            this.rangeClick = false;
        }, 100);
    }

    /**
     * Upadte text and range input
     * @param {string} data value
     */
    onRangeBarChange(value) {
        let percent = value;
        if(this._type === 'light' || this._type === 'soil') {
            percent = value/10
        }
        if(this._type === 'soil') {
            value = value/10
        }
        this.iconAlertValue.innerText = Math.round(value);
        this.rangeMeter.style.height = `${percent}%`;
    }

    /**
     * Update swim service for threshold
     * @param {number} set option value
     */
    updateThreshold(value) {
        this._nodeRef.command('setThreshold', value);
    }

    /**
     * Update swim service for option
     * @param {number} set option value
     */
    updateOption(value) {
        const nodeRef = swim.nodeRef(this._parent.swimUrl, 'sensor/light');
        nodeRef.command('setOption', value);
    }
}


class Graphic {
    constructor(host, type, unit, color) {
        this._type = type;
        this._unit = unit;
        this._tween = swim.Transition.duration(1000);
        this._color = swim.Color.parse(color);
        this._bgColor = swim.Color.parse('#4a4a4a').alpha(0.6);
        this._tickColor = swim.Color.parse('#fff').alpha(0);
        this._nodeRef = swim.nodeRef(host, `/sensor/${this._type}`);
        this._linkGauge = null;
        this._linkChart = null;

        const parentGauge = document.querySelector(`.box-${this._type} .gauge-wrap .graphic`);
        this._appGauge = new swim.HtmlAppView(parentGauge);
        this._canvasGuage = this._appGauge.append("canvas");
        this._title = new swim.TextRunView(`-- ${this._unit}`).font("20px sans-serif");
        this._gauge = new swim.GaugeView()
            .innerRadius('45%')
            .dialColor(this._bgColor)
            .title(this._title)
            .font("18px sans-serif")
            .textColor(this._color)
            .cornerRadius(50);
        this._canvasGuage.append(this._gauge);

        this._dial = new swim.DialView()
            .value(0)
            .meterColor(this._color);
        this._gauge.append(this._dial);

        const parentChart = document.querySelector(`.box-${this._type} .chart-wrap .graphic`);
        this._appChart = new swim.HtmlAppView(parentChart);
        this._canvasChart = this._appChart.append("canvas");

        this._chart = new swim.ChartView()
            .bottomAxis("time")
            .leftAxis("linear")
            .leftDomainPadding([0.1, 0.1])
            .domainColor(this._tickColor)
            .tickMarkColor(this._tickColor)
            .textColor(this._tickColor);
        this._canvasChart.append(this._chart);

        this._plot = new swim.AreaGraphView()
            .fill(this._color);
        this._chart.addPlot(this._plot);

        this.connect();
    }

    connect() {
        this._linkGauge = this._nodeRef.downlinkValue().laneUri('latest')
            .didSet((v)=> {
                let value =  v.numberValue()
                let meter = v.numberValue()/1000;
                let titleValue = (this._type === "soil")? Math.round(v.numberValue()/10) : v.numberValue();

                if (this._type === 'temperatureCh1') {
                    meter = value/100;
                }

                this._dial.value(meter, this._tween);
                this._title.text(`${titleValue} ${this._unit}`);
            }).open();

        this._linkChart = this._nodeRef.downlinkMap().laneUri('history')
            .didUpdate((k, v)=> {
                const timestamp = k.numberValue();
                this._plot.insertDatum({x: timestamp, y: Math.round(v.numberValue()/10) , y2: 0});
            }).didRemove((k, v)=> {
                this._plot.removeDatum(k.value);
            }).open();

        return this;
    }

    disconnect() {
        if(this._linkGauge) { this._linkGauge.close(); }
        if(this._linkChart) { this._linkChart.close(); }
        return this;
    }
}
