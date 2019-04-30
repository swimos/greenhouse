class Bot {
    constructor(botName, botData, parentDiv) {
        this.botName = botName;
        this.botData = botData;
        this.plantName = null;
        this.botAddress = `ws://${botData.address.split(':')[0]}:5620`;
        this.botStatus = null;
        this.parentDiv = parentDiv;
        this.domNode = document.createElement('div');
        this.domNode.id = `${this.botName}Bot`
        this.domNode.onclick = null;
        this.valueDownlink = null;
        this.mapDownlink = null;
        this.botSensorValues = {};
        this.isUpdating = false;
        this.botStatusLane = null;
        this.botDestLane = null;
        this.botPlantName = null;
        this.botSensorLane = null;
        this.botStatus = false;
        this.elementCache = null;
    }

    start() {
        this.domNode = document.createElement('div');
        this.parentDiv.id = `${this.botName}Bot`
        this.parentDiv.onclick = this.clickHandler.bind(this);
        this.valueDownlink = swim.downlinkValue().host(this.botAddress)
        this.mapDownlink = swim.downlinkMap().host(this.botAddress)
        this.botSensorValues = {};

        this.isUpdating = false;

        this.botStatusLane = this.valueDownlink.node('/bot/'+this.botName).lane('status')
        .didSet((msg) => {
            if(this.botStatus !== msg) {
                this.botStatus = msg;
                this.updateData(this.botData);
            }
        });
        this.botDestLane = this.mapDownlink.node('/bot/'+this.botName).lane('destination')
        .didUpdate((key, value) => {
            if(this.botDestination ==! key) {
                console.info('destination: ', key, value)
                this.botDestination = key;
                this.updateData(this.botData);
            }
        });

        this.botPlantName = this.valueDownlink.node('/bot/'+this.botName).lane('plantName')
        .didSet((value)=> {
            this.plantName = value;
        });

        this.botSensorLane = this.mapDownlink.node('/bot/'+this.botName).lane('join/latest')
        .didUpdate((key, value) => {
            if(this.botSensorValues[key] !== value) {
                this.botSensorValues[key] = value;
                this.updateData(this.botData);
            }
        });

        this.botStatus = false;


        this.domNode.className = `${this.botData.type}Div`;
        this.parentDiv.appendChild(this.domNode);
        this.botStatusLane.open();
        this.botDestLane.open();
        this.botSensorLane.open();
        this.botPlantName.open()
    }

    stop() {
        this.parentDiv.removeChild(this.domNode);
    }

    createView(botData) {
        // build a bot menu button
        this.isUpdating = true;
        if(botData.type === 'bot') {
            // console.log('data: ', botData);
            (this.plantName)? this.domNode.classList.add('watering') : this.domNode.classList.remove('watering');

            const bubbleDiv = document.createElement('div');
            bubbleDiv.className = 'bubbles';
            this.domNode.appendChild(bubbleDiv);

            const statusDiv = document.createElement('div');
            statusDiv.className = 'status-icon';
            this.domNode.appendChild(statusDiv);

            const botIconDiv = document.createElement('div');
            botIconDiv.className = 'bot-icon';

            const botPicture = document.createElement('picture');
            botIconDiv.appendChild(botPicture);

            const botNameSpan = document.createElement('span');
            botNameSpan.innerText = botData.name;
            this.elementCache['botNameSpan'] = botNameSpan;
            botIconDiv.appendChild(botNameSpan);
            this.domNode.appendChild(botIconDiv);

            const plantNameDiv = document.createElement('div');
            plantNameDiv.className='plant-name';
            plantNameDiv.innerText = (this.plantName)? this.plantName : 'Idle';
            this.elementCache['plantNameDiv'] = plantNameDiv;
            this.domNode.appendChild(plantNameDiv);

            const infoList = document.createElement('ul');
            infoList.className = 'info';

            const tempListItem = document.createElement('li');
            tempListItem.innerHTML = `${this.botSensorValues.temperature}&deg;`;
            this.elementCache['tempListItem'] = tempListItem;
            infoList.appendChild(tempListItem);

            const pressListItem = document.createElement('li');
            pressListItem.innerHTML = `${this.botSensorValues.pressure}mb;`;
            this.elementCache['pressListItem'] = pressListItem;
            infoList.appendChild(pressListItem);

            const humListItem = document.createElement('li');
            humListItem.innerHTML = `${this.botSensorValues.humidity}%;`;
            this.elementCache['humListItem'] = humListItem;
            infoList.appendChild(humListItem);

            this.domNode.appendChild(infoList);

        }

        // build a plant row item
        if(botData.type === 'plant') {
            // console.log('botData: ', botData);
            let hasAlert = (botData.light && botData.light.hasAlert) || (botData.soil && botData.soil.hasAlert) || (botData.temperatureCh1 && botData.temperatureCh1.hasAlert);
            this.parentDiv.style['background-image'] = `url('/assets/images/plantMon/${botData.name}-card.jpg')`;
            this.parentDiv.style['background-repeat'] = `no-repeat`;
            this.parentDiv.style['background-position'] = `center center`;
            this.parentDiv.style['background-size'] = 'cover';

            let icon = 'ok';
            if(false) {
                icon = 'disabled'
            } else if(botData.soil && botData.soil.hasAlert) {
                icon = 'soil'
            } else if(botData.temperatureCh1 && botData.temperatureCh1.hasAlert) {
                icon = 'temperature'
            } else if(botData.light && botData.light.hasAlert) {
                icon = 'light'
            }

            this.parentDiv.className  = `square ${hasAlert? 'alert-' + icon : ''}`;

            const arrowDown = document.createElement('div');
            arrowDown.className = 'icon-arrow';
            arrowDown.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="33" viewBox="0 0 34 33"> <path fill-rule="nonzero" d="M24.25.694H9.75v14.5H.083L17 32.111l16.917-16.917H24.25z"/></svg>`;
            arrowDown.style.display = botData.hasAlert? 'block' : 'none'
            this.elementCache['arrowDown'] = arrowDown;
            this.domNode.appendChild(arrowDown);

            const pictureElement = document.createElement('picture');
            pictureElement.className = 'icon';

            const plantIcon = new Image();
            plantIcon.src = `/assets/icons/plant-alert-${icon}.svg`;
            plantIcon.alt = `Icon ${icon}`;
            this.elementCache['plantIcon'] = plantIcon;

            pictureElement.appendChild(plantIcon);
            this.domNode.appendChild(pictureElement);

            const plantName = document.createElement('h2');
            plantName.className = 'title';
            plantName.innerHTML = botData.name;
            this.elementCache['plantName'] = plantName;

            this.domNode.appendChild(plantName);

            const infoList = document.createElement('ul');
            infoList.className = 'info';

            const lightListItem = document.createElement('li');
            lightListItem.innerHTML = `${botData.light.currentValue}lx`;
            this.elementCache['lightListItem'] = lightListItem;
            infoList.appendChild(lightListItem);

            const soilListItem = document.createElement('li');
            soilListItem.innerHTML = `${botData.soil.currentValue/10}%`;
            this.elementCache['soilListItem'] = soilListItem;
            infoList.appendChild(soilListItem);

            const tempListItem = document.createElement('li');
            tempListItem.innerHTML = `${botData.temperatureCh1.currentValue}%`;
            this.elementCache['tempListItem'] = tempListItem;
            infoList.appendChild(tempListItem);

            this.domNode.appendChild(infoList);            

        }
        this.botData = botData;
        this.isUpdating = false;
    }

    updateData(botData) {
        if(this.elementCache === null) {
            this.elementCache = {};
            this.createView(botData);
        }
        if(this.isUpdating) {
            return;
        }
        this.isUpdating = true;
        
        const index = this.parentDiv.getAttribute('data-index');

        // console.info('Bot.updateData', botData, this.botSensorValues)
        if(botData.type === 'bot') {
            // console.log('data: ', botData);
            (this.plantName)? this.domNode.classList.add('watering') : this.domNode.classList.remove('watering');

            if(this.elementCache['botNameSpan'].innerText !== this.botData.name) {
                this.elementCache['botNameSpan'].innerText = this.botData.name;
            }
            if(this.elementCache['plantNameDiv'].innerText !== this.plantName) {
                this.elementCache['plantNameDiv'].innerText = (this.plantName)? this.plantName : 'Idle';
            }
            if(this.elementCache['tempListItem'].innerHTML !== `${this.botSensorValues.temperature}&deg;`) {
                this.elementCache['tempListItem'].innerHTML = `${this.botSensorValues.temperature}&deg;`;
            }
            if(this.elementCache['pressListItem'].innerHTML !== `${this.botSensorValues.pressure}mb`) {
                this.elementCache['pressListItem'].innerHTML = `${this.botSensorValues.pressure}mb`;
            }
            if(this.elementCache['humListItem'].innerHTML !== `${this.botSensorValues.humidity}%`) {
                this.elementCache['humListItem'].innerHTML = `${this.botSensorValues.humidity}%`;
            }

        }
        if(botData.type === 'aggregator') {
            // this.domNode.innerHTML = `${this.botData.name}`
        }
        if(botData.type === 'plant') {
            let hasAlert = (botData.light && botData.light.hasAlert) || (botData.soil && botData.soil.hasAlert) || (botData.temperatureCh1 && botData.temperatureCh1.hasAlert);
            this.parentDiv.style['background-image'] = `url('/assets/images/plantMon/${botData.name}-card.jpg')`;
            
            let icon = 'ok';
            if(false) {
                icon = 'disabled'
            } else if(botData.soil && botData.soil.hasAlert) {
                icon = 'soil'
            } else if(botData.temperatureCh1 && botData.temperatureCh1.hasAlert) {
                icon = 'temperature'
            } else if(botData.light && botData.light.hasAlert) {
                icon = 'light'
            }

            this.elementCache['plantIcon'].src = `/assets/icons/plant-alert-${icon}.svg`;
            this.elementCache['plantIcon'].alt = `Icon ${icon}`;

            this.elementCache['arrowDown'].style.display = hasAlert ? 'block' : 'none'

            const newClassName = `square ${hasAlert? 'alert-' + icon : ''}`
            if(this.parentDiv.className !== newClassName) {
                this.parentDiv.className = newClassName;
            }

            if(botData.name !== this.botData.name) {
                this.elementCache['plantName'].innerHTML = botData.name;
            }

            if(this.elementCache['lightListItem'].innerHTML !== `${(this.botData.light)? this.botData.light.currentValue : 0} lx`) {
                this.elementCache['lightListItem'].innerHTML = `${(this.botData.light)? this.botData.light.currentValue : 0} lx`;
            }

            if(this.elementCache['soilListItem'].innerHTML !== `${(this.botData.soil)? this.botData.soil.currentValue/10 : 0}%`) {
                this.elementCache['soilListItem'].innerHTML = `${(this.botData.soil)? this.botData.soil.currentValue/10 : 0}%`;
            }

            if(this.elementCache['tempListItem'].innerHTML !== `${(this.botData.temperatureCh1)? this.botData.temperatureCh1.currentValue : 0}°`) {
                this.elementCache['tempListItem'].innerHTML = `${(this.botData.temperatureCh1)? this.botData.temperatureCh1.currentValue : 0}°`;
            }

        }
        this.botData = botData;
        setTimeout(() => {
            
            this.isUpdating = false;
        }, 1);
        
    }

    clickHandler() {
        // console.info('click', this.botData.type);
        if(this.botData.type === 'bot') {
            window.location.href = `http://${this.botData.address}/SenseHat`;
        }
        if(this.botData.type === 'aggregator') {
            window.location.href = `http://${this.botData.address}/aggregate`;
        }
        if(this.botData.type === 'plant') {
            window.location.href = `http://${this.botData.address}/plantMon`;
        }
    }
}
