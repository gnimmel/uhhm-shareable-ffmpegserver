import createSketch from './sketch-vidtest.js';

const FPS = 30;
const CANVAS_WIDTH = 540;
const CANVAS_HEIGHT = 960;
const CANVAS_SCALE = 1.0;


// Check for url params
var urlParams = {};
var url = window.location.href;

console.log("Current URL: " + url);

var urlObj = new URL(url);
var pams = new URLSearchParams(urlObj.search);

// What params have we been passed?
for (let pair of pams.entries()) {
  console.log(pair[0] + ', ' + pair[1]);
  urlParams[pair[0]] = pair[1];
}

function onShowVideoLink() {
  fetch('http://localhost:4000/kill-capture', {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json',
        }//,
        //mode: 'no-cors' // no-cors mode for fetch
  })
  .then(response => {
    if (response.status === 200) {
      console.log('Request succeeded');
    } else {
      console.log('Request failed', response);
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
  });
}

let progressElem = document.getElementById('progress');
let dowloadElem = document.getElementById('downloadDiv');
let durationElem = document.getElementById('duration');
let timerElem = document.getElementById('timer');
let renderTextElem = document.getElementById('renderText');

let fpsElem = document.getElementById('fps');
let widthElem = document.getElementById('width');
let heightElem = document.getElementById('height');

let canvasWidth = widthElem.value = (urlParams.hasOwnProperty('cw')) ? parseInt(urlParams['cw']) * CANVAS_SCALE : CANVAS_WIDTH * CANVAS_SCALE;
let canvasHeight = heightElem.value = (urlParams.hasOwnProperty('ch')) ? parseInt(urlParams['ch']) * CANVAS_SCALE : CANVAS_HEIGHT * CANVAS_SCALE;
let framerate = fpsElem.value = (urlParams.hasOwnProperty('fps')) ? parseInt(urlParams['fps']) : FPS;

document.getElementById('resolution').textContent = 'Output Resolution: ' + canvasWidth + 'x' + canvasHeight;

// Create the flow sketch
const mySketch = createSketch(
    framerate, 
    canvasWidth, 
    canvasHeight, 
    onShowVideoLink, 
    durationElem, 
    progressElem,
    timerElem,
    renderTextElem
    );
let thep5 = new p5(mySketch, 'the-sketch');

// Events
//document.getElementById('startButton').onclick = thep5.onStartCapture;
/*
if (urlParams['name'])
{
  var name = urlParams['name'];  
  thep5.onStartCapture();
}
else
{
  var name = "Name is missing";
}
console.log(name);
*/
const onReload = () => {
    //let currentURL = window.location.href;
    let urlWithoutQueryString = window.location.protocol + "//" + window.location.host + window.location.pathname;

    let queryString = `fps=${fpsElem.value}&cw=${widthElem.value}&ch=${heightElem.value}`;
    let newURL = `${urlWithoutQueryString}?${queryString}`;
    
    window.location.href = newURL;
}
document.getElementById('reloadButton').onclick = onReload;