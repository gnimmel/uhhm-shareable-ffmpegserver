let sentences = [
    "This is the first sentence. It is a long sentence that needs to be split into several lines.",
    "Here is another sentence that is also quite long and needs to be split into several lines.",
    "This is the final sentence. It is the longest sentence of all and definitely needs to be split into several lines."
  ];
  
  let currentSentence = 0;
  let animatingIn = false; 
  let animatingOut = false; 
  let animationStartTime = 0;
  let baseTimePerLine = 700; 
  let timeIncreasePerLineIn = 50; 
  let timeIncreasePerLineOut = 25; 
  let timeBetweenSentences = 1500; 
  let delayStartTime = 0;
  let lines = [];
  let fontSize = 20;
  let leading = 22;
  let textBoxWidth = 250;
  let textX, textY;
  
  function setup() {
    createCanvas(400, 600);
    textFont('Georgia');
    textSize(fontSize);
    textLeading(leading);
    textX = width / 2;
    textY = height / 2;
    lines = splitIntoLines(sentences[currentSentence], textBoxWidth);
    animationStartTime = millis();
    delayStartTime = millis();
  }
  
  function draw() {
    background(220);
    textAlign(CENTER);
    let boxHeight = lines.length * leading;
    let boxTop = textY - boxHeight / 2;
  
    for (let i = 0; i < lines.length; i++) {
      let y;
      if (animatingIn && currentSentence !== 0) {
        let timePerLine = baseTimePerLine + (lines.length - 1 - i) * timeIncreasePerLineIn;
        let t = constrain((millis() - animationStartTime) / timePerLine, 0, 1);
        y = lerp(-leading, boxTop + i * leading, easeOutCubic(t));
      } else if (animatingOut) {
        let timePerLine = baseTimePerLine + (lines.length - 1 - i) * timeIncreasePerLineOut;
        let t = constrain((millis() - animationStartTime) / timePerLine, 0, 1);
        y = lerp(boxTop + i * leading, height + leading, easeInCubic(t));
      } else {
        y = boxTop + i * leading;
      }
      text(lines[i], textX, y);
    }
  
    if (animatingIn && millis() - animationStartTime > baseTimePerLine + (lines.length - 1) * timeIncreasePerLineIn) {
      animatingIn = false;
      delayStartTime = millis();
    }
  
    if (!animatingIn && !animatingOut && millis() - delayStartTime > timeBetweenSentences) {
      animatingOut = true;
      animationStartTime = millis();
    }
  
    if (animatingOut && millis() - animationStartTime > baseTimePerLine + (lines.length - 1) * timeIncreasePerLineOut) {
      animatingOut = false;
      currentSentence = (currentSentence + 1) % sentences.length;
      lines = splitIntoLines(sentences[currentSentence], textBoxWidth);
      animationStartTime = millis();
      animatingIn = currentSentence !== 0;
      delayStartTime = currentSentence === 0 ? millis() : 0;
    }
  }
  
  function splitIntoLines(sentence, maxLineWidth) {
    let words = sentence.split(" ");
    let lines = [];
    let line = "";
    for (let i = 0; i < words.length; i++) {
      let newLine = line + (line === "" ? "" : " ") + words[i];
      if (textWidth(newLine) > maxLineWidth) {
        lines.push(line);
        line = words[i];
      } else {
        line = newLine;
      }
    }
    lines.push(line);
    return lines;
  }
  
  function easeInCubic(t) {
    return t * t * t;
  }
  
  function easeOutCubic(t) {
    return (--t) * t * t + 1;
  }
  