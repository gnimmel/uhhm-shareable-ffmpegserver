let img;
let shaderProgram;
let graphics;

// GLSL programs
let vertexShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  gl_Position = vec4(aPosition, 1.0);
}
`;

let fragmentShader = `
precision highp float;

uniform sampler2D uTexture;
uniform sampler2D uDisplacementMap;
uniform float uTime;

varying vec2 vTexCoord;

void main() {
  // Read the displacement map.
  vec4 displacement = texture2D(uDisplacementMap, vTexCoord);

  // Create a distorted texture coordinate.
  vec2 distortedTexCoord = vTexCoord + (displacement.xy - 0.5) * 0.01 * sin(uTime);

  // Read the original texture with the distorted texture coordinate.
  vec4 color = texture2D(uTexture, distortedTexCoord);

  gl_FragColor = color;
}
`;

function preload() {
  // Load a displacement map
  img = loadImage('displacement_map.jpg'); // Replace this with the path to your displacement map image
}

function setup() {
  createCanvas(710, 400, WEBGL);
  graphics = createGraphics(710, 400);
  shaderProgram = createShader(vertexShader, fragmentShader);
  shader(shaderProgram);
  noStroke();
}

function draw() {
  graphics.background(220);
  graphics.textSize(72);
  graphics.textAlign(CENTER, CENTER);
  graphics.text('Hello, world!', width / 2, height / 2);

  shaderProgram.setUniform('uTexture', graphics);
  shaderProgram.setUniform('uDisplacementMap', img);
  shaderProgram.setUniform('uTime', millis() / 1000.0);

  beginShape(TRIANGLES);
  vertex(-1, -1, 0, 0, 1);
  vertex(1, -1, 0, 1, 1);
  vertex(1, 1, 0, 1, 0);
  vertex(1, 1, 0, 1, 0);
  vertex(-1, 1, 0, 0, 0);
  vertex(-1, -1, 0, 0, 1);
  endShape();
}
