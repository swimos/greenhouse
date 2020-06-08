class AggregatePage extends BasePage{
    constructor(parent, host) {
        super(parent, routeName);
        this._parent = parent;
        this._maxPlants = 8;
        this._aggregateUrl = 'ws://127.0.0.1:9001';
        this._boxes = [];

        this._plants = {};
        this._alerts = {};

        this._app = new swim.HtmlAppView(parent).append('div')
            .className('row planterBoxContainer');

        for(let i = 0; i < this._maxPlants; i++) {
            this._boxes.push(new Box(this._app));
        }
    }

    start(aggregateUrl) {
        super.start(aggregateUrl);
        this._aggregateUrl = aggregateUrl;
        // this._aggregateUrl = 'ws://192.168.0.210:9001'; // Testing

        const nodeRef = swim.nodeRef(this._aggregateUrl, '/aggregate');
        this._plantsLink = nodeRef.downlinkMap().laneUri('join/latest')
            .didUpdate( this.updatePlants.bind(this) ).open();

        this._alertsLink = nodeRef.downlinkMap().laneUri('join/alert')
            .didUpdate( this.updateAlerts.bind(this) ).open();
    }

    updatePlants(k, v) {
        const device = k.stringValue();
        const name = device.split('|')[0];
        let plant = this._plants[device];

        if(!plant) {
            let element = null;
            this._boxes.forEach((box)=> {
                if(!box.device && !element) {
                    element = box;
                }
            });
            element.device = device;
            plant = this._plants[device] = element;
        }

        if(!plant.display) {
            plant.show()
                .title(name)
                .setbackground(name);
        }

        plant.light(v.get('light').numberValue() || 0)
            .soil((v.get('soil').numberValue()/10)|| 0)
            .temp(v.get('temperatureCh1').numberValue() || 0);
    }

    updateAlerts(k, v) {
        const device = k.stringValue();
        const plant = this._plants[device];
        const light = (v.get('light').stringValue() === 'true');
        const soil = (v.get('soil').stringValue() === 'true');
        const temperature = (v.get('temperatureCh1').stringValue() === 'true');
        if(plant) {
            let iconName = null;
            if(soil) {
                iconName = 'soil';
            } else if(temperature) {
                iconName = 'temperature';
            } else if(light) {
                iconName = 'light';
            }

            plant.setAlert(iconName);
        }
    }



}

class Box {
    constructor(parent) {
        this._parent = parent;
        this._tween = swim.Transition.duration(350);
        this._device = null;
        this._display = false;

        this._box = this._parent.append('div')
            .className('col col-12 col-sm-6 col-md-4 col-lg-3 box');

        this._square = this._box.append('div')
            .className('square');
        this._square.setStyle('background-repeat', 'no-repeat');
        this._square.setStyle('background-position', 'center center');
        this._square.setStyle('background-size', 'cover');

        this._link = this._square.append('a')
            .display('block')
            .width('100%')
            .height('100%')
            .opacity(0)
            .display('none');

        this._plant = this._link.append('div')
            .className('plantDiv');

        this._arrow = this._plant.append('div')
            .className('icon-arrow')
            .opacity(0);

        this._arrowSvg = this._arrow.append('svg')
            .width('34')
            .height('33')
            .viewBox('0 0 34 33')
            .append('path')
            .d('M24.25.694H9.75v14.5H.083L17 32.111l16.917-16.917H24.25z');
        this._arrowSvg.setAttribute('fill-rule', 'nonzero');

        this._icon = this._plant.append('picture')
            .className('icon');

        this._iconImg = this._icon.append('img');
        this._iconImg.setAttribute('alt', 'Icon ok');
        this.setIcon();

        this._title = this._plant.append('h2')
            .className('title')
            .text('--');

        this._info = this._plant.append('ul')
            .className('info')

        this._light = this._info.append('li')
            .text('-- lx');

        this._soil = this._info.append('li')
            .text('--%');

        this._temp = this._info.append('li')
            .text('--°');
    }

    get device(){
        return this._device;
    }

    set device(string) {
        this._device = string;
        this._link.setAttribute('href', `//${string.split('|')[1]}/plantMon`);
        return this;
    }

    get display() {
        return this._display;
    }

    title(string) {
        this._title.text(`${string || '--'}`);
        return this;
    }

    light(value) {
        this._light.text(`${value || '--'} lx`);
        return this;
    }

    soil(value) {
        this._soil.text(`${value || '--'}%`);
        return this;
    }

    temp(value) {
        this._temp.text(`${value || '--'}°`);
        return this;
    }

    setAlert(string) {
        this._square.className(`square ${string? 'alert-' + string : '' }`);
        (string)? this.alertShow() : this.alertHide();
        this.setIcon(string);
    }

    setIcon(string) {
        this._iconImg.setAttribute('src', `/assets/icons/plant-alert-${(string)? string : 'ok' }.svg`);
    }

    setbackground(string) {
        this._square.setStyle('background-image', `url(/assets/images/plantMon/${string}-card.jpg)`);
        return this;
    }

    alertShow() {
        this._arrow.opacity(1);
        return this;
    }

    alertHide() {
        this._arrow.opacity(0);
        return this;
    }

    show() {
        this._link.display('block');
        this._link.opacity(1, this._tween);
        this._display = true;
        return this;
    }

    hide() {
        this._link.display('none');
        this._link.opacity(0);
        this._display = false;
        return this;
    }
}
