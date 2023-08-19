let sentences = [
    "This is the first sentence. It is a long sentence that needs to be split into several lines.",
    "Here is another sentence that is also quite long and needs to be split into several lines.",
    "This is the final sentence. It is the longest sentence of all and definitely needs to be split into several lines."
  ];
  
  let currentSentence = 0;
  let animatingIn = true;
  let animationStartTime = 0;
  let baseTimePerLine = 500; // Base duration of the animation for each line
  let timeIncreasePerLineIn = 50; // Increase in the duration for each line for 'in' animations
  let timeIncreasePerLineOut = 25; // Increase in the duration for each line for 'out' animations
  let timeBetweenSentences = 1000; // Delay between sentences
  let delayStartTime = 0;
  let isDelaying = false;
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
  }
  
  function draw() {
    background(220);
    textAlign(CENTER);
    let boxHeight = lines.length * leading;
    let boxTop = textY - boxHeight / 2;
  
    for (let i = 0; i < lines.length; i++) {
      let timePerLine = baseTimePerLine + (lines.length - 1 - i) * (animatingIn ? timeIncreasePerLineIn : timeIncreasePerLineOut);
      let t = constrain((millis() - animationStartTime) / timePerLine, 0, 1);
      let y;
      if (animatingIn) {
        y = lerp(-leading, boxTop + i * leading, easeOutCubic(t));
      } else {
        y = lerp(boxTop + i * leading, height + leading, easeInCubic(t));
      }
      text(lines[i], textX, y);
    }
  
    if (millis() - animationStartTime > baseTimePerLine + (lines.length - 1) * (animatingIn ? timeIncreasePerLineIn : timeIncreasePerLineOut)) {
      if (animatingIn) {
        if (!isDelaying) {
          isDelaying = true;
          delayStartTime = millis();
        } else if (millis() - delayStartTime > timeBetweenSentences) {
          isDelaying = false;
          animatingIn = false;
          animationStartTime = millis();
        }
      } else {
        currentSentence = (currentSentence + 1) % sentences.length;
        lines = splitIntoLines(sentences[currentSentence], textBoxWidth);
        animationStartTime = millis();
        animatingIn = true;
      }
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
  