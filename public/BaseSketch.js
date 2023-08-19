import { setupSphere, drawSphere } from '/text_animations/sphere/sphere.js';

class BaseSketch {
    constructor(fps, canvasWidth, canvasHeight, lyrics, textColor, videoPath, DURATION = 15, REQUIRES_GL = true) {
        this.fps = fps;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.lyrics = lyrics;
        this.textColor = textColor;
        this.videoPath = videoPath;
        this.bVideoReady = false;

        this.DURATION = DURATION;
        this.REQUIRES_GL = REQUIRES_GL;
        this.w_gloffset = (this.REQUIRES_GL) ? -(this.canvasWidth/2) : 0;
        this.h_gloffset = (this.REQUIRES_GL) ? -(this.canvasHeight/2) : 0;
        this.intPixDensity = 2;
        this.frameCount = 0;
        this.numFrames = this.fps * this.DURATION;

    }
    
    p5preload(p) {
        this.font = p.loadFont("fonts/PPMori-Regular.otf");
    }

    p5setup(p) {
        console.log("fps: " + this.fps);
        console.log("sketch::SETUP");
        p.frameRate(this.fps);
        p.pixelDensity(this.intPixDensity);
        p.createCanvas(this.canvasWidth, this.canvasHeight, (this.REQUIRES_GL) ? p.WEBGL : p.P2D);
        p.background(0);

        this.video = p.createVideo(this.videoPath);

        this.video.elt.onloadstart = function() {
            console.log("Video load started.");
        }

        this.video.elt.oncanplaythrough = () => {
            if (!this.bVideoReady) {
                this.bVideoReady = true;
                this.video.play();
                console.log("Video can play through.");
            }
        }

        this.video.elt.onerror = function() {
            console.log("An error occurred while loading the video.");
        }

        this.video.volume(0);
        this.video.loop();
        this.video.hide();
        this.video.elt.setAttribute('playsinline', true);
        this.video.elt.setAttribute('loop', true);
        this.video.elt.setAttribute('muted', true);

        setupSphere(p, this.font, this.lyrics, this.textColor);

        this.theCanvas = document.getElementById('defaultCanvas0');

        p.textFont(this.font);
    }

    p5draw(p) {
        if (!this.bVideoReady) return;
        p.clear();

        p.image(this.video, this.w_gloffset, this.h_gloffset, p.width, p.height);
        drawSphere(p);

        p.fill(0);
        p.textSize(20);
        p.text(`FPS: ${p.nf(p.frameRate(), 2, 2)}`, -this.canvasWidth/2, -400);
    }
}

export default BaseSketch;