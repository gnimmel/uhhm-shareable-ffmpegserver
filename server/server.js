/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var path = require('path');
const fs = require('fs');
const os = require('os');

var optionSpec = {
  options: [
    { option: 'help', alias: 'h', type: 'Boolean',  description: 'displays help'},
    { option: 'port', alias: 'p', type: 'Int',      description: 'port',  default: '8080'},
    { option: 'base-dir',         type: 'String',   description: 'folder to serve', default: 'public'},
    { option: 'video-dir',        type: 'String',   description: 'folder to save video files to', default: 'output'},
    { option: 'frame-dir',        type: 'String',   description: 'folder to save frames to', default: 'output'},
    { option: 'keep-frames',      type: 'Boolean',  description: 'do not delete the frames after encoding'},
    { option: 'allow-arbitrary-ffmpeg-arguments',      type: 'Boolean',  description: 'allow arbitrary ffmpeg arguments passed from browser', default: "false"},
  ],
  helpStyle: {
    typeSeparator: '=',
    descriptionSeparator: ' : ',
    initialIndent: 4,
  },
};

// Check if output directory exists and create it if not
try {
  // Define the output directory path in the user's home directory
  let outputDirPath;
  if (process.platform === 'win32')
    outputDirPath = path.join(os.homedir(), 'Desktop', 'output');
  else
    outputDirPath = path.join(os.homedir(), 'output');

  // Check if the directory exists
  if (!fs.existsSync(outputDirPath)) {
      // If the directory doesn't exist, create it
      fs.mkdirSync(outputDirPath, { recursive: true, mode: 0o755 });
  } else {
      // If the directory already exists, update its permissions to be read/write
      fs.chmodSync(outputDirPath, 0o755);
  }
} catch (e) {
  console.error(e);
};

var optionator = require('optionator')(optionSpec);

try {
  var args = optionator.parse(process.argv);
} catch (e) {
  console.error(e);
  process.exit(1);  // eslint-disable-line
}

var printHelp = function() {
  console.log(optionator.generateHelp());
  process.exit(0);  // eslint-disable-line
};

if (args.help) {
  printHelp();
}

// Video Server
function startServer() {
  var VideoServer = require('./video-server');
  args.videoDir = path.join(process.cwd(), args.videoDir);
  args.frameDir = path.join(process.cwd(), args.frameDir);
  var server = new VideoServer(args);

  app.listen(apiPort, () => {
    console.log(`API port: ${apiPort}`);
  });
}

// API Server
var apiPort = 4000;

var express = require('express');
var playwright = require('playwright');
const cors = require('cors')

const model = require('../public/model');

if (process.pkg)
  model.init(path.join(__dirname ,'..', 'public', 'videos'));
else
  model.init(path.join(process.cwd(), 'public', 'videos'));


var app = express();
app.use(cors())
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'public', 'videos')));

let browser = null;

// Get the Sketch
// http://localhost:4000/get-sketch-by-id?id=123456

/*app.get('/get-sketch-by-id', (req, res) => {
  var id = req.query.id;

  try {
    if (model.getAssetData(id)) {
      if (process.pkg)
        res.redirect(`/shareable.html?id=${id}`);
        //res.sendFile(path.join(__dirname ,'..', 'public', 'shareable.html'));
      else
        res.redirect(`/shareable.html?id=${id}`);
        //res.sendFile(path.join(process.cwd(), 'public', 'shareable.html'));
    } else {
        res.status(404).send({ error: 'No data found for this id' });
    }
  } catch (error) {
    console.log("Fetch asset data failed:", error);
    res.status(500).send({ error: 'Internal server error' });
  }
});*/

const ejs = require('ejs');

app.post('/add-asset-data', async (req, res) => {
  const { id, emotion, lyrics, doCapture } = req.body;

  // Validate request body
  if (!id || !lyrics || !emotion || !doCapture) {
    return res.status(400).json({
      message: 'Request body should contain id, lyrics, emotion, and doCapture',
    });
  }

  console.log(`Received data - id: ${id}, emotion: ${emotion}, lyrics: ${lyrics}, doCapture: ${doCapture}`);
  model.setAssetData(id, emotion, lyrics);

  res.status(202).json({
    message: 'data seeded successfully',
    id: id
  });

  res.send();
});

app.get('/get-sketch-by-id', (req, res) => {
  var id = req.query.id;
  
  try {
    if (model.getAssetData(id)) {
      // Read the HTML file
      fs.readFile(process.pkg ? path.join(__dirname ,'..', 'public', 'shareable.html') : path.join(process.cwd(), 'public', 'shareable.html'), 'utf8', function(err, data) {
        if (err) {
          console.log("Read file failed:", err);
          res.status(500).send({ error: 'Internal server error' });
          return;
        }

        // Render the HTML file as an EJS template, passing the id as a parameter
        var html = ejs.render(data, { id: id, serverIp: model.getHostIP() });

        // Send the rendered HTML
        res.send(html);
      });
    } else {
      res.status(404).send({ error: 'No data found for this id' });
    }
  } catch (error) {
    console.log("Fetch asset data failed:", error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// TODO: clean this up and seperate set data from the playwright junk
app.post('/get-sketch', async (req, res) => {
  const { id, emotion, lyrics, doCapture } = req.body;

  // Validate request body
  if (!id || !lyrics || !emotion || !doCapture) {
    return res.status(400).json({
      message: 'Request body should contain id, lyrics, emotion, and doCapture',
    });
  }

  console.log(`Received data - id: ${id}, emotion: ${emotion}, lyrics: ${lyrics}, doCapture: ${doCapture}`);
  model.setAssetData(id, emotion, lyrics);

  // Read the HTML file
  fs.readFile(process.pkg ? path.join(__dirname ,'..', 'public', 'shareable.html') : path.join(process.cwd(), 'public', 'shareable.html'), 'utf8', function(err, data) {
    if (err) {
      console.log("Read file failed:", err);
      res.status(500).send({ error: 'Internal server error' });
      return;
    }

    // Render the HTML file as an EJS template, passing the id as a parameter
    var html = ejs.render(data, { id: id });

    // Send the rendered HTML
    res.send(html);
  });

  if (JSON.parse(doCapture)) 
  {
    // Construct the playwright url
    const url = "http://localhost:8080/uhhm-capturer.html?id=" + id;
    console.log(`url: ${url}`);

    // We're using MSEdge installed in the host filesystem
    let execPath;
    if (process.platform === 'win32') {
      // Windows
      execPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    } else if (process.platform === 'darwin') {
      // macOS
      execPath = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
    }

    // Playwright junk
    try {
      browser = await playwright.chromium.launch( { 
        args: [
          "--ipc=host", 
          "--mute-audio"
        ], 
        executablePath: execPath,
        video: 'on', 
        headless: false, 
        chromiumSandbox: false
      }); 

      const context = await browser.newContext();
      const page = await context.newPage();

      page.on('pageerror', err => {
        console.error('Page error: ', err.toString());
      });
      page.on('console', msg => {
        if (msg.type() === 'log') {
          for (let i = 0; i < msg.args().length; ++i)
            console.log(`${i}: ${msg.args()[i]}`);
        }
        if (msg.type() === 'error') {
          console.error(msg.text());
        }
      });

      await page.goto(url);
      console.log(`url opened: ${url}`);

      /*res.status(202).json({
        message: 'Playwright process launched successfully',
        id: id
      });

      res.send();
      */
    } catch (error) {
      // An unexpected error occurred.
      console.error(error);
      res.status(500).send({ error: 'Playwright failed' });
      if (browser) {
        await browser.close();
        browser = null;
      }
    }
  }
});

  app.get('/kill-capture', (req, res) => {
    res.status(200).send({ success: 'killing playwright browser' });

    if (browser) {
        setTimeout(async () => {
            try {
                await browser.close();
                browser = null;
            } catch (error) {
                console.error('Error closing browser: ', error);
            }
        }, 1000); // delay of 1000ms (1 second)
    }
  });

  app.get('/assetdata/:id', (req, res) => {
    const id = req.params.id;
    //console.log("app.get /assetdata/id:" + id);

    if (model.getAssetData(id)) {
        res.json(model.getAssetData(id));
    } else {
        res.status(404).send({ error: 'No data found for this id' });
    }
  });

  //process.pkg ? path.join(__dirname ,'..', 'public', 'shareable.html') : path.join(process.cwd(), 'public', 'shareable.html'), 'utf8', function(err, data)

  app.get('/videos/:filename', function(req, res) {
    try {
      var filename = req.params.filename;
      var videoPath = path.resolve(__dirname, 'videos', filename);
      
      console.log("videoPath from get request: " + videoPath);

      // Check if file exists before sending
      fs.access(videoPath, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(`File ${videoPath} does not exist`);
          res.status(404).send({ error: 'File not found' });
        } else {
          console.log("sending video");
          res.sendFile(videoPath);
        }
      });
    } catch (error) {
      console.log("An error occurred:", error);
      res.status(500).send({ error: 'Internal server error' });
    }
  });

/*app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../output', filename);

  res.download(filePath, (err) => {
    if (err) {
      res.status(404).send(`File not found: ${filePath}`);
    }
  });
});*/

/*app.get('/list-all-files', (req, res) => {
  const directoryPath = path.join(__dirname, '../public');
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return res.status(500).send('Unable to scan directory: ' + err);
    } 
    res.send(files);
  });
});*/

startServer();






