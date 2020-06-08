class ZonesPage {
    constructor(parent, routeName) {
        this._parent = new swim.HtmlAppView(parent);
        this._routeName = routeName;
        this._aggregateUrl = null;
    }

    start(aggregateUrl) {
        this._aggregateUrl = aggregateUrl;
        this._aggregateUrl = 'ws://192.168.0.210:9001';

        const nodeRef = swim.nodeRef(this._aggregateUrl, '/zone');

        nodeRef.downlinkMap().laneUri('join/latest')
            .didUpdate((k, v)=> {
                console.log('k: ', k, ' v: ', v);
            }).open();

        // Logic ??
        new DeviceMonitor(this._parent); // testing
    }
}

class DeviceMonitor {
    constructor(parent) {
        this._parent = parent;
        this._device = null;

        this._deviceWrap = this._parent.append('div').className('device-wrap row');

        this._title = this._deviceWrap.append('div').className('col col-12 title')
            .append('h2').text('--')

        const column1 = this._deviceWrap.append('div').className('col col-12 col-lg-6')
            .append('div').className('row');

        // Chart 1
        const chart1Box = column1.append('div').className('col col-12 chart chart-1')
            .append('article').className('wrap')
            .append('div').className('box');

        const chart1Header = chart1Box.append('header');
        chart1Header.append('h3').text('Light (lx)');
        chart1Header.append('span').text('ALL PLANTS');

        this._chart1Canvas = chart1Box.append('div').className('graphic').append('canvas');
        this._chart1 = new swim.ChartView()
            .bottomAxis("time")
            .leftAxis("linear")
            .leftDomainPadding([0.1, 0.1])
            .domainColor(swim.Color.parse('#4a4a4a').alpha(0))
            .tickMarkColor(swim.Color.parse('#4a4a4a').alpha(0))
            .font("12px sans-serif")
            .textColor(swim.Color.parse('#4a4a4a').alpha(0))
            .topGutter(0)
            .rightGutter(0)
            .bottomGutter(-5)
            .leftGutter(0);
        this._chart1Canvas.append(this._chart1);

        this._chart1plot = new swim.AreaGraphView()
            .fill('#fee54e');
        this._chart1.addPlot(this._chart1plot);

        // Chart 2
        const chart2Box = column1.append('div').className('col col-12 chart chart-2')
            .append('article').className('wrap')
            .append('div').className('box');

        const chart2Header = chart2Box.append('header');
        chart2Header.append('h3').text('Moisture (%)');
        chart2Header.append('span').text('ALL PLANTS');

        this._chart2Canvas = chart1Box.append('div').className('graphic').append('canvas');
        this._chart2 = new swim.ChartView()
            .bottomAxis("time")
            .leftAxis("linear")
            .leftDomainPadding([0.1, 0.1])
            .domainColor(swim.Color.parse('#4a4a4a').alpha(0))
            .tickMarkColor(swim.Color.parse('#4a4a4a').alpha(0))
            .font("12px sans-serif")
            .textColor(swim.Color.parse('#4a4a4a').alpha(0))
            .topGutter(0)
            .rightGutter(0)
            .bottomGutter(-5)
            .leftGutter(0);
        this._chart2Canvas.append(this._chart2);

        this._chart2plot = new swim.AreaGraphView()
            .fill('#4bc8ff');
        this._chart2.addPlot(this._chart2plot);

        const column2 = this._deviceWrap.append('div').className('col col-12 col-lg-6')
            .append('div').className('row');

        // kpi 1
        const kpi1Box = column2.append('div').className('col col-12 col-md-6 kpi kpi-1')
            .append('div').className('wrap')
            .append('div').className('box');

        const kpi1Header = kpi1Box.append('header');
        kpi1Header.append('h3').text('Message');
        kpi1Header.append('span').text('ALL PLANTS');

        this._kpi1Value = kpi1Box.append('div').className('graphic').text('--');

        // kpi 2
        const kpi2Box = column2.append('div').className('col col-12 col-md-6 kpi kpi-1')
            .append('div').className('wrap')
            .append('div').className('box');

        const kpi2Header = kpi2Box.append('header');
        kpi2Header.append('h3').text('Alert');
        kpi2Header.append('span').text('ALL PLANTS');

        this._kpi2Value = kpi2Box.append('div').className('graphic').text('--');

        // Chart 3
        const chart3Box = column2.append('div').className('col col-12 chart chart-3')
            .append('article').className('wrap')
            .append('div').className('box');

        const chart3Header = chart3Box.append('header');
        chart3Header.append('h3').text('Temp (°)');
        chart3Header.append('span').text('ALL PLANTS');

        this._chart3Canvas = chart1Box.append('div').className('graphic').append('canvas');
        this._chart3 = new swim.ChartView()
            .bottomAxis("time")
            .leftAxis("linear")
            .leftDomainPadding([0.1, 0.1])
            .domainColor(swim.Color.parse('#4a4a4a').alpha(0))
            .tickMarkColor(swim.Color.parse('#4a4a4a').alpha(0))
            .font("12px sans-serif")
            .textColor(swim.Color.parse('#4a4a4a').alpha(0))
            .topGutter(0)
            .rightGutter(0)
            .bottomGutter(-5)
            .leftGutter(0);
        this._chart3Canvas.append(this._chart3);

        this._chart3plot = new swim.AreaGraphView()
            .fill('#ff904e');
        this._chart3.addPlot(this._chart3plot);
    }

    device(string) {
        if(!string) {  return this._device; }
        this._device = string;
        this._deviceWrap.elemId(`${string}`);
        this._title.text(`${string}`);
        return this;
    }

    addLightPoint(x, y) {
        this._chart1plot.insertDatum({x: x, y: y, y2: 0});
        return this;
    }

    removeLightPoint(x, y) {
        this._chart1plot.removeDatum({x: x, y: y, y2: 0});
        return this;
    }

    addMoisturePoint(x, y) {
        this._chart2plot.insertDatum({x: x, y: y, y2: 0});
        return this;
    }

    removeMoisturePoint(x, y) {
        this._chart2plot.removeDatum({x: x, y: y, y2: 0});
        return this;
    }

    addTempPoint(x, y) {
        this._chart3plot.insertDatum({x: x, y: y, y2: 0});
        return this;
    }

    removeTempPoint(x, y) {
        this._chart3plot.removeDatum({x: x, y: y, y2: 0});
        return this;
    }

    msgValue(value) {
        this._kpi1Value.text(`${value}`);
        return this;
    }

    alertValue(value) {
        this._kpi2Value.text(`${value}`);
        return this;
    }

}
