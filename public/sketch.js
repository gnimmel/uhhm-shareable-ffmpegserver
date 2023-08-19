import { setupSphere, drawSphere } from './text_animations/sphere/sphere.js';

const createSketch = (fps, canvasWidth, canvasHeight, lyrics, textColor, videoPath, showVideoLinkFunc = null) => {
    return (p) => {

        const DURATION = 15;
        const REQUIRES_GL = true;

        let w_gloffset = (REQUIRES_GL) ? -(canvasWidth/2) : 0
        let h_gloffset = (REQUIRES_GL) ? -(canvasHeight/2) : 0

        let intPixDensity = 2;

        let capturer;
        let frameCount = 0;
        let numFrames = fps * DURATION;

        let font;

        let theCanvas = null;
        let bVideoReady = false;

        let virtualTime = 0;
        let virtualFrameRate = fps;  // number of frames per second
        let frameDuration = 1 / virtualFrameRate;  // duration of a single frame in seconds

        let video;

        p.preload = () => {
            font = p.loadFont("fonts/PPMori-Regular.otf");
        }

        function videoLoaded() {
            console.log('Video Loaded');
            video.play();  // Play the video
        }

        p.setup = () => {
            console.log("fps: " + fps);
            console.log("sketch::SETUP");
            p.frameRate(fps);
            p.pixelDensity(intPixDensity);
            //console.log("sketch::createCanvas:before");
            p.createCanvas(canvasWidth, canvasHeight, (REQUIRES_GL) ? p.WEBGL : p.P2D);
            //console.log("sketch::createCanvas:after");
            p.background(0);
            
            //console.log("sketch::createVideo:before");
            video = p.createVideo(videoPath, videoLoaded);
            //console.log("sketch::createVideo:after");
            
            video.elt.onloadstart = function() {
                console.log("Video load started.");
            }
            video.elt.oncanplay = function() {
                //console.log("Video can play.");
                //p.onStartCapture();
            }
            video.elt.oncanplaythrough = function() {
                //console.log("Video can play through without stopping for buffering.");
                if (!bVideoReady) {
                    if (!showVideoLinkFunc)
                        p.onStartCapture();
                    bVideoReady = true;
                }
            }
            video.elt.onerror = function() {
                console.log("An error occurred while loading the video.");
            }

            video.volume(0);
            video.loop();
            video.hide();
            video.elt.setAttribute('playsinline', true);
            //video.elt.setAttribute('autoplay', true);
            video.elt.setAttribute('loop', true);
            video.elt.setAttribute('muted', true);

            setupSphere(p, font, lyrics, textColor);

            theCanvas = document.getElementById('defaultCanvas0');
        }

        p.draw = () => {
            if (!bVideoReady) return;

            video.time(virtualTime);
            p.image(video, w_gloffset, h_gloffset, p.width, p.height);

            drawSphere(p);

            if (capturer) {
                if (video.time() > 0)
                    capturer.capture(theCanvas);

                ++frameCount;
                virtualTime += frameDuration;

                if (frameCount === numFrames) {
                    capturer.stop();
                    if (showVideoLinkFunc)
                        capturer.save(showVideoLinkFunc);
                    else
                        capturer.save();

                    capturer = null;
                }
            }
        }
        
        p.onStartCapture = () => {
            console.log("Starting capture");
            
            frameCount = 0;

            capturer = new CCapture({
                format: 'ffmpegserver',
                verbose: false,
                framerate: fps,
                //onProgress: onProgress,
                name: 'uhhm-shareable-test',
            });

            capturer.start();
        }
    };
};

export default createSketch;
