let img;
//let gl;
//let cameraX;

export function setupSphere(p, font, strText, textColor) 
{
  //createCanvas(windowWidth, windowHeight, WEBGL);
  p.perspective(p.PI / 3.0, p.width/p.height, 0.1, 500);
  //p.perspective();
  // Create the p5.Graphics object and draw the text onto it
  img = p.createGraphics(500, 300);
  img.textSize(12);
  img.fill(textColor); // text color
  
  img.pixelDensity(10);
  img.textFont(font);
  //textSize(20);
  img.textLeading(15);
  img.noStroke();
  img.textAlign(p.CENTER, p.TOP);
  //fill(0);

  /*
  let text = strText;
  let x = parseInt(img.width*0.5)-parseInt(img.width*0.25);
  let y = parseInt(img.height*0.4);
  let spacing = 2; // Increase or decrease for more/less spacing

  for (let i = 0; i < text.length; i++) {
    img.text(text.charAt(i), x, y);
    x += img.textWidth(text.charAt(i)) + spacing;
  }
  */
  img.text(strText, 
    parseInt(img.width*0), // + w_gloffset, 
    parseInt(img.height*0.4),//-parseInt(img.height*0.25), // + h_gloffset, 
    parseInt(img.width*0.25), 
    parseInt(img.height*0.5));

  img.text(strText, 
        parseInt(img.width*0.33),//)-parseInt(img.width*0.25), // + w_gloffset, 
        parseInt(img.height*0.4),//-parseInt(img.height*0.25), // + h_gloffset, 
        parseInt(img.width*0.25), 
        parseInt(img.height*0.5));
  
  img.text(strText, 
        parseInt(img.width*0.66),//)-parseInt(img.width*0.25), // + w_gloffset, 
        parseInt(img.height*0.4),//-parseInt(img.height*0.25), // + h_gloffset, 
        parseInt(img.width*0.25), 
        parseInt(img.height*0.5));
    
  p.pixelDensity(1);
}

export function drawSphere(p) 
{
  p.push();
  p.camera(500, 0, 0, 0, 0, 0, 0, 1, 0);

  let gl = p._renderer.GL;
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.FRONT);
  
  p.noStroke(); 
  p.texture(img);
  //p.rotateY(p.frameCount * -0.005);
  //p.rotateY(-0.005 * p.deltaTime);
  p.rotateY(p.millis() * -0.00025);
  //console.log("p.deltaTime: " + p.deltaTime);
  p.sphere(147);

  gl.disable(gl.CULL_FACE);
  p.pop();

}
