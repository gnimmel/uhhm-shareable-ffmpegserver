let local = "http://localhost:8080/";
let azure = "https://uhhm-ffmpegserver.azurewebsites.net/";
let cc = "ffmpegserver/CCapture.js";
let ff = "ffmpegserver/ffmpegserver.js";

let s1 = document.createElement('script');
let s2 = document.createElement('script');

console.log(window.location.hostname)

if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    s1.src = local + cc;
    s2.src = local + ff;
} else {
    s1.src = azure + cc;
    s2.src = azure + ff;
}

document.head.appendChild(s1);
document.head.appendChild(s2);  