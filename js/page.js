// Logic for the control and use of the web page

import fiatJSON from '../data/fiat.js';
import coinJSON from '../data/coins.js';

export default {
    addCrypto: addCrypto,
    loadData: loadData,
    getSelectedFiatValueObject: getSelectedFiatValueObject,
    getSelectedFromPreview: getSelectedFromPreview,
    getSelectedValues: getSelectedValues
}

function getSelectedValues() {
    return {
        selectedFiatObj: this.getSelectedFiatValueObject(),
        selectedCoins: this.getSelectedFromPreview(),
        outputFormat: buildStringFormat(),
        literalRound: document.querySelector('input[name="literal-round"]:checked').dataset.count,
        percentageRound: document.querySelector('input[name="percentage-round"]:checked').dataset.count,
        refreshTimer: document.getElementById('refreshInterval').value,
        groupBool: document.getElementById('groupcheckbox').checked,
        apiSelector: "live",
        formatSelector: document.querySelector('input[name="variance-type"]:checked').dataset.variance,
        userPercentageModifer: parseFloat(document.getElementById('user-percentage').value / 100),
        cacheBool: document.getElementById('cachecheckbox').checked
    }
}

function buildStringFormat() {
    let outputFormat = '';
    let commaFormat = document.getElementById('comma-separate'),
        decimalFormat = document.querySelector('input[name="decimal-count"]:checked');

    if (commaFormat.checked){
        outputFormat += ",";
    }
    if (decimalFormat.dataset.count != '∞') {
       outputFormat += "." + decimalFormat.dataset.count + "f";
    }

    if (outputFormat != '') {
       outputFormat = ":0" + outputFormat;
    }

    outputFormat = "{" + outputFormat + "}";
    return outputFormat;
}

function getSelectedFromPreview() {
    const cryptoPreview = document.getElementsByClassName('touchbar-widget crypto');

    let selectedCryptos = [];

    // Since cryptoElements returns a HTMLCollection, do this hack to get the Array elements.
    [].forEach.call(cryptoPreview, (cryptoItem) => {
        selectedCryptos.push(cryptoItem.dataset.ticker);
    });
    return selectedCryptos;
}

function updatePreviewColour(elm) {
    const id = elm.styleElement.id,
        cryptoColour = document.getElementById(id),
        cryptoTouch = document.getElementById(id.replace('-colour', '-touch'));

    if (cryptoTouch) {
        cryptoTouch.style.backgroundColor = cryptoColour.style.backgroundColor;
    }
}

function updatePreviewSVGColour(elm) {
    const id = elm.styleElement.id,
        cryptoColour = document.getElementById(id),
        cryptoTouch = document.getElementById(id.replace('-svg-colour', '-touch-icon'));

    if (cryptoTouch) {
        cryptoTouch.style.fill = cryptoColour.style.backgroundColor;
    }
}
function updatePreviewFiat() {
    const selectedFiatObj = getSelectedFiatValueObject(),
        cryptoElements = document.getElementsByClassName('crypto');

    // Since cryptoElements returns a HTMLCollection, do this hack to get the Array elements.
    [].forEach.call(cryptoElements, (crypto) => {
        let touchText = crypto.getElementsByTagName('span')[0].innerHTML;
        touchText = selectedFiatObj.symbol + ' ' + touchText.substring(touchText.indexOf(' ') + 1);
        crypto.getElementsByTagName('span')[0].innerHTML = touchText;
    });
}

function getSelectedFiatValueObject() {
    // Get selected currency option
    const selectedOp = document.getElementById("currency-selector").selectedOptions[0].value;
    return getSelectedValue(new fiatJSON.data(), 'ticker', selectedOp)[0];
}

function getSelectedValue(array, key, value) {
    return array.filter((obj) => {
        return obj[key] === value;
    });
}

function addCrypto(event) {
    const target = event.target;

    if (target.checked) {

        const cryptoTouch = document.createElement('div'),
            imgTouch = document.createElement('img'),
            selectedFiatObj = getSelectedFiatValueObject(),
            targetColour = document.getElementById(target.dataset.ticker + '-colour'),
            text = document.createElement('span'),
            touchArea = document.getElementById('crypto-touchbar-area');

        cryptoTouch.setAttribute('id', target.dataset.ticker + '-touch');
        cryptoTouch.className = 'touchbar-widget crypto';
        cryptoTouch.dataset.ticker = target.dataset.ticker;

        cryptoTouch.style.backgroundColor = targetColour.style.backgroundColor;
        touchArea.appendChild(cryptoTouch);

        imgTouch.className = 'svg touchbar-crypto-icon';
        imgTouch.setAttribute('id', target.dataset.ticker + '-touch-icon');
        imgTouch.setAttribute('src', target.dataset.icon);
        imgTouch.style.width = '22';
        imgTouch.style.height = '22';
        cryptoTouch.appendChild(imgTouch);

        text.innerHTML = selectedFiatObj.symbol + ' 000.00';
        cryptoTouch.appendChild(text);

        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if(xhr.readyState == 4 && xhr.status == 200) {
                let svg = xhr.responseXML.getElementsByTagName('svg')[0];

                svg.setAttribute('id', imgTouch.id);
                svg.setAttribute('class', 'svg touchbar-crypto-icon replaced-svg');

                svg.removeAttribute('xmlns:a');

                if(!svg.hasAttribute('viewBox') && svg.hasAttribute('height') && svg.hasAttribute('width')) {
                    svg.setAttribute('viewBox', '0 0 ' + svg.getAttribute('height') + ' ' + svg.getAttribute('width'));
                }
                imgTouch.parentElement.replaceChild(svg, imgTouch);
            }
        }
        xhr.open('GET', target.dataset.icon, true);
        xhr.send(null);


    } else {
        const cryptoTouch = document.getElementById(target.dataset.ticker + '-touch');

        cryptoTouch.parentNode.removeChild(cryptoTouch);
    }
}

function addCoin(coinData) {
    const cryptoSelector = document.createElement('div'),
    element = document.createElement('input'),
    text = document.createElement('label'),
    colour = document.createElement('button'),
    icon = document.createElement('img'),
    colourSVG = document.createElement('button');

    element.type = 'checkbox';

    element.dataset.icon = coinData.Icon;
    element.dataset.ticker = coinData.Ticker;
    element.dataset.name = coinData.Name;
    element.dataset.startColour = coinData.Colour;
    element.addEventListener('change', addCrypto);

    text.setAttribute('for', coinData.Name);
    text.innerHTML = coinData.Name;

    colour.className = "jscolor {onFineChange:'updatePreviewColour(this)',valueElement:null,value:'"+ coinData.Colour +"'}";
    colour.style.width = '20';
    colour.style.height = '20';
    colour.id = coinData.Ticker + '-colour';

    colourSVG.className = "jscolor {onFineChange:'updatePreviewSVGColour(this)',valueElement:null,value:'000000'}";
    colourSVG.style.width = '20';
    colourSVG.style.height = '20';
    colourSVG.id = coinData.Ticker + '-svg-colour';

    icon.className = 'touchbar-crypto-icon';
    icon.setAttribute('src', coinData.Icon);
    icon.style.width = '22';
    icon.style.height = '22';

    cryptoSelector.appendChild(element);
    cryptoSelector.appendChild(icon);
    cryptoSelector.appendChild(text);
    cryptoSelector.appendChild(colour);
    cryptoSelector.appendChild(colourSVG);
    document.getElementById('coins').appendChild(cryptoSelector);

    // Initialise jscolor on new element
    jscolor.installByClassName('jscolor');

}

function removeCustomCoin(event) {
    const targetValue = event.value,
        cryptoTouch = document.getElementById(targetValue + '-touch'),
        cryptoSelect = document.getElementById(targetValue + '-colour');
    if (cryptoTouch) cryptoTouch.parentNode.removeChild(cryptoTouch);
    if (cryptoSelect) {
        let div = cryptoSelect.parentNode;
        div.parentNode.removeChild(div);
    }
}

function loadData() {

    let dynCoinArr = [];

    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://min-api.cryptocompare.com/data/all/coinlist');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
      if (xhr.status === 200) {
        let jsonData = JSON.parse(xhr.responseText);
  
        let count = 0;
        let input = jsonData.Data;

        for (let property in input) {
            if(input.hasOwnProperty(property)) {
            let customProperties = {
                "icon": 'img/TODO.svg',
                "color": '6CAAE5'
            };
            let showTopX = false;
            let customData = getSelectedValue(new coinJSON.data(), 'Ticker', input[property].Symbol)[0];
            if (customData) {
                if (customData.ShowDefault) showTopX = true;
                customProperties = {
                    "icon": 'node_modules/cryptocoins-icons/SVG/' + customData.Icon + '.svg',
                    "color": customData.Colour
                }
            }
            dynCoinArr.push({
                "value" : input[property].Symbol,
                "label" : input[property].CoinName,
                "customProperties" : customProperties,
                "selected" : showTopX
            });
            count++;
           }
        }

        let genericExamples = new Choices('#dynamic-coinlist', {
            placeholderValue: 'Search for a CryptoCurrency ('+count+') supported',
            searchPlaceholderValue: 'Search for a CryptoCurrency ('+count+') supported',
            noResultsText: 'Search returned no results',
            choices: dynCoinArr,
            searchResultLimit: 15,
            shouldSort: true,
            searchFields: ['label', 'value'],
            searchEnabled: true,
            searchChoices: true,
            addItems: true,
            duplicateItems: false,
            removeItemButton: true
          });
      }
      else {
        console.log('Request failed.  Returned status of ' + xhr.status);
      }
    };
    xhr.send();

    // Currency dropdown menu
    document.getElementById('currency-selector')
            .addEventListener('change', updatePreviewFiat);

    // enable colour picker on dynamically generated inputs
    jscolor.installByClassName('jscolor');

    // events for on change of searchbox input
    let dynamicCoinList = document.getElementById('dynamic-coinlist');
    dynamicCoinList.addEventListener('addItem', function(event) {
        let customCoin = {
            "Colour" : event.detail.customProperties.color,
            "Name" : event.detail.label,
            "Ticker" : event.detail.value,
            "Icon" : event.detail.customProperties.icon
        };
        addCoin(customCoin);
    });
    
    dynamicCoinList.addEventListener('removeItem', function(event) {
        removeCustomCoin(event.detail);
    });

}
