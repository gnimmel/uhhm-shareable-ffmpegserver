let sentences = [
    "This is the first sentence, which is a bit longer than the others.",
    "Here is another one.",
    "And the final sentence."
  ];
  let currentSentenceIndex = 0;
  let currentWordIndex = 0;
  let timePerWord = 200; // 500 milliseconds = 0.5 second
  let timePerSentence = 1000; // 3000 milliseconds = 3 seconds
  let nextWordTime = 0;
  let nextSentenceTime = sentences[0].split(" ").length * timePerWord + timePerSentence;
  let startTime;
  let maxLineWidth = 250; // Maximum width of a line
  let lineHeight = 36; // Height of a line, should be larger than the text size
  
  function setup() {
    createCanvas(800, 800);
    textSize(32);
    textAlign(LEFT, CENTER);
    frameRate(30);
    startTime = millis();
  }
  
  function draw() {
    background(220);
    let elapsed = millis() - startTime;
  
    if (elapsed >= nextWordTime) {
      let sentence = sentences[currentSentenceIndex];
      let words = sentence.split(" ");
  
      if (currentWordIndex < words.length) {
        currentWordIndex++;
        nextWordTime += timePerWord;
      }
    }
  
    if (elapsed >= nextSentenceTime) {
      currentSentenceIndex++;
      currentWordIndex = 0;
  
      if (currentSentenceIndex >= sentences.length) {
        currentSentenceIndex = 0;
        startTime = millis();
        elapsed = 0;
      }
  
      let nextSentence = sentences[currentSentenceIndex];
      nextWordTime = elapsed + timePerWord;
      nextSentenceTime = elapsed + nextSentence.split(" ").length * timePerWord + timePerSentence;
    }
  
    if (currentSentenceIndex < sentences.length) {
      let sentence = sentences[currentSentenceIndex];
      let words = sentence.split(" ");
      let displayedWords = words.slice(0, currentWordIndex);
  
      let lines = [];
      let currentLine = [];
      let currentLineWidth = 0;
  
      // Break down the words into lines
      for (let word of words) {
        let wordWidth = textWidth(word + " ");
        
        if (currentLineWidth + wordWidth > maxLineWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = [];
          currentLineWidth = 0;
        }
        
        currentLine.push(word);
        currentLineWidth += wordWidth;
      }
      
      // Add the last line
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
  
      // Draw each line
      let wordCount = 0;
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let lineY = height / 2 - (lines.length - 1) * lineHeight / 2 + i * lineHeight;
        let lineX = (width - textWidth(line.join(" "))) / 2;
  
        for (let j = 0; j < line.length; j++) {
          if (wordCount < currentWordIndex) {
            text(line[j], lineX, lineY);
          }
          lineX += textWidth(line[j] + " ");
          wordCount++;
        }
      }
    }
  }
  