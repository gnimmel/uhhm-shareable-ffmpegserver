//import createSketch from './sketch.js';
import ExtendedSketch from './ExtendedSketch.js';

let lyrics;// = "to rock a rhyme that's right on time";
let vidPath;// = "videos/UHHM_Shareable_Asset_Competitive_3.mp4";
//const TMP_VID_PATH = "videos/UHHM_Shareable_Asset_Inspired_6.mp4";
let textColor;// = [112, 255, 178];

const FPS = 30;
const CANVAS_WIDTH = 540;
const CANVAS_HEIGHT = 960;
const CANVAS_SCALE = 1.0;

let canvasWidth = CANVAS_WIDTH * CANVAS_SCALE;
let canvasHeight = CANVAS_HEIGHT * CANVAS_SCALE;
let framerate = FPS;

window.onload = async function() 
{
  // Check for url params
  let urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('id')) {
      let id = urlParams.get('id');
  //if (id) {
      // Validate the 'id' parameter
      /*if (isNaN(id)) {
          console.log("Invalid 'id' parameter in URL.");
          return;
      }*/

      console.log(`id is: ${id}`);

      try {
          // Fetch the asset data
          await fetchAssetData(id);

          // Create the sketch
          let mySketch = new ExtendedSketch(framerate, canvasWidth, canvasHeight, lyrics, textColor, vidPath, 15, true, onCaptureComplete, id);

          let thep5 = new p5((p) => {
              p.preload = () => mySketch.p5preload(p);
              p.setup = () => mySketch.p5setup(p);
              p.draw = () => mySketch.p5draw(p);
          }, 'the-sketch');
      } catch (error) {
          console.error(`Error fetching asset data for id ${id}:`, error);
      }
  } else {
      console.log("No 'id' parameter in URL.");
  }
};

async function fetchAssetData(id) {
  try {
    console.log(`Fetch Asset Data for id: ${id}`);
    let response = await fetch(`http://localhost:4000/assetdata/${id}`);
    //let response = await fetch(`/assetdata/${id}`);

    if (!response.ok) {
        throw new Error("HTTP error " + response.status);
    }

    let json = await response.json();

    console.log(json);
    
    vidPath = json.filepath;
    lyrics = json.lyrics;
    textColor = json.textcolor;
    console.log(`Filename: ${vidPath}, Lyrics: ${lyrics}, Text color: ${textColor}`);
  } catch (error) {
    console.log("Fetch error:", error);
  }
}

function onCaptureComplete() {
  fetch('http://localhost:4000/kill-capture', {
  //fetch('/kill-capture', {
        method: 'GET', 
        headers: {
            'Content-Type': 'application/json',
        }
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
