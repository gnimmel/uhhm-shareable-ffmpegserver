//import createSketch from './sketch.js';
import BaseSketch from '/BaseSketch.js';

let lyrics;// = "to rock a rhyme that's right on time";
let vidPath;// = "videos/UHHM_Shareable_Asset_Competitive_3.mp4";
let textColor;// = [112, 255, 178];

const FPS = 60;
//const CANVAS_WIDTH = 1080;
//const CANVAS_HEIGHT = 1920;
//const CANVAS_SCALE = 1.0;

let canvasWidth;// = CANVAS_WIDTH * CANVAS_SCALE;
let canvasHeight;// = CANVAS_HEIGHT * CANVAS_SCALE;
let framerate = FPS;

window.onload = async function() 
{
  let screenWidth = window.screen.width;
  canvasWidth = parseInt(screenWidth / 2);
  canvasHeight = parseInt(canvasWidth * (16 / 9));
  console.log("Resolution: " + canvasWidth + "x" + canvasHeight);

  if (id) {
      console.log(`id is: ${id}`);

      try {
          // Fetch the asset data
          await fetchAssetData(id);

          // Create the sketch
          let mySketch = new BaseSketch(framerate, canvasWidth, canvasHeight, lyrics, textColor, vidPath, 15, true);

          let thep5 = new p5((p) => {
              p.preload = () => mySketch.p5preload(p);
              p.setup = () => mySketch.p5setup(p);
              p.draw = () => mySketch.p5draw(p);
          }, 'the-sketch');
      } catch (error) {
          console.error(`Error fetching asset data for id ${id}:`, error);
      }
  } else {
      console.log("'id' not found");
  }
};

async function fetchAssetData(id) {
  try {
      //let response = await fetch(`http://localhost:4000/assetdata/${id}`);
      let response = await fetch(`http://${serverIp}:4000/assetdata/${id}`);

      if (!response.ok) {
          throw new Error("HTTP error " + response.status);
      }

      let json = await response.json();

      console.log(json);
      
      vidPath = `http://${serverIp}:4000/videos/${json.file}`;

      lyrics = json.lyrics;
      textColor = json.textcolor;
      console.log(`Filepath: ${vidPath}, Lyrics: ${lyrics}, Text color: ${textColor}`);
  } catch (error) {
      console.log("Fetch error:", error);
  }
}
