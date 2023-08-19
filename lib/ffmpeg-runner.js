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
 * THEORY OF2 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const debug = require('debug')('ffmpeg-runner');
const { EventEmitter } = require('events');
//const ffmpeg = require('ffmpeg-static');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
//const ffmpegPath = ffmpeg.path;
//const { spawn } = require('child_process');
const spawn = require('child_process').spawn;
const os = require('os');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const { execSync } = require('child_process');

//const ffmpeg = spawn(ffmpegPath, args);
//ffmpeg.on('exit', onExit);

class FFMpegRunner {
  constructor(args) 
  {
    console.log(ffmpeg.path, ffmpeg.version);
    
    this.emitter = new EventEmitter();
    
    let baseDir;
    if (process.pkg) {
      // We are running in a package
      baseDir = path.dirname(process.execPath);
    } else {
      // We are running in a normal process
      baseDir = __dirname;
    }
    
    const relativePath = path.relative(baseDir, ffmpeg.path);
    
    console.log("relativePath:: " + relativePath); 
    
    let pkgPath;
    if (process.pkg) {
      pkgPath = path.join(process.pkg.defaultEntrypoint, relativePath);
    } else {
      pkgPath = ffmpeg.path
    }
    if (fs.existsSync(pkgPath)) {
      console.log('pkgPath:: The path is correct, file exists' + pkgPath);
    } else {
      console.log('pkgPath:: The path is incorrect, file does not exist' + pkgPath);
    }

    let tmpPath;
    if (process.pkg) {
      // We are running inside a pkg executable, we need to copy the binary to a temporary location
      if (process.platform === 'win32')
        tmpPath = path.join(os.tmpdir(), 'ffmpeg.exe');
      else
        tmpPath = path.join(os.tmpdir(), 'ffmpeg');
    
      try {
        fs.copyFileSync(pkgPath, tmpPath);
        console.log(`Copied ffmpeg binary to temporary location: ${tmpPath}`);
    
        // Set permissions to 755 to ensure the binary is executable
        fs.chmodSync(tmpPath, 0o755);
        console.log(`Set permissions to 755 for ${tmpPath}`);
      } catch (err) {
        console.error(`Failed to copy ffmpeg binary to temporary location or set permissions: ${err.message}`);
        process.exit(1);
      }
    
    } else {
      // We are running in a normal process, we can execute the binary directly
      tmpPath = pkgPath
    }
    
    // Now we can execute ffmpeg
    try {
      let output = child_process.execSync(`${tmpPath} -version`);
      console.log(output.toString());
    } catch (err) {
      console.error(`Failed to execute ffmpeg: ${err.message}`);
      process.exit(1);
    }
    
    console.log(`${tmpPath} ${args.join(' ')}`);

    console.log(`SPAWN ffmpeg:: ${tmpPath}`);

    const proc = spawn(tmpPath, args);
    const stdout = [];
    const stderr = [];
    const frameNumRE = /frame= *(\d+) /;

    proc.stdout.on('data', (data) => {
      const str = data.toString();
      const lines = str.split(/(\r?\n)/g);
      stdout.push(...lines);
    });

    proc.stderr.on('data', (data) => {
      const str = data.toString();
      const fndx = str.lastIndexOf('frame=');
      if (fndx >= 0) {
        const m = frameNumRE.exec(str.substr(fndx));
        if (m) {
          this.emitter.emit('frame', parseInt(m[1]));
        }
      }
      const lines = str.split(/(\r?\n)/g);
      stderr.push(...lines);
    });

    proc.on('close', (code) => {
      console.log(`FFMpegRunner::close code: ${code}`);
      const result = {
        code: parseInt(code),
        stdout: stdout.join(''),
        stderr: stderr.join(''),
      };
      if (result.code !== 0) {
        this.emitter.emit('error', result);
        console.log('FFMpegRunner::emit error');
        console.log(result);
      } else {
        this.emitter.emit('done', result);
        console.log('FFMpegRunner::emit done');
        console.log(result);
      }
    });
  }

  on(event, listener) {
    this.emitter.on(event, listener);
  }
}

module.exports = FFMpegRunner;



