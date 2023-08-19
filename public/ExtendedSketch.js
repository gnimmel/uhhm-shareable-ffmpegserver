import { drawSphere } from '/text_animations/sphere/sphere.js';
import BaseSketch from '/BaseSketch.js';

class ExtendedSketch extends BaseSketch {
    constructor(fps, canvasWidth, canvasHeight, lyrics, textColor, videoPath, DURATION = 15, REQUIRES_GL = true, showVideoLinkFunc = null, id = null) {
        super(fps, canvasWidth, canvasHeight, lyrics, textColor, videoPath, DURATION, REQUIRES_GL);

        this.showVideoLinkFunc = showVideoLinkFunc;
        this.capturer = null;
        this.frameCount = 0;
        this.numFrames = fps * DURATION;
        this.id = id;

        this.virtualTime = 0;
        this.virtualFrameRate = fps;
        this.frameDuration = 1 / this.virtualFrameRate;
    }

    onStartCapture() {
        console.log("Starting capture");

        this.frameCount = 0;

        this.capturer = new CCapture({
            format: 'ffmpegserver',
            verbose: false,
            framerate: this.fps,
            name: this.id + '-UHHM-FLOWSCHOLAR-shareable',
        });

        this.capturer.start();
    }

    p5setup(p) {
        super.p5setup(p);

        this.video.elt.oncanplaythrough = () => {
            if (!this.bVideoReady) {
                this.onStartCapture();
                this.bVideoReady = true;
            }
        }
    }

    p5draw(p) {
        //super.p5draw(p);
        if (!this.bVideoReady) return;

        this.video.time(this.virtualTime);
        p.image(this.video, this.w_gloffset, this.h_gloffset, p.width, p.height);
        drawSphere(p);

        if (this.capturer) {
            if (this.video.time() > 0)
                this.capturer.capture(this.theCanvas);

            ++this.frameCount;
            this.virtualTime += this.frameDuration;

            if (this.frameCount === this.numFrames) {
                this.capturer.stop();
                if (this.showVideoLinkFunc)
                    this.capturer.save(this.showVideoLinkFunc);
                else
                    this.capturer.save();

                this.capturer = null;
            }
        }
    }
}

export default ExtendedSketch;