(function(d, io, $) {
    'use strict'
    const socket = io()
    var colors = [
        "#0d5ac1", "#283593", "#cd2f00", "#01ac53", "#f50057", "#0971f0", "#5bb32d", "#f50422", "#880e4f", "#009688", "#1dc18", "#0f5997", "#fc6b57", "#e65100", "#d02e29", "#fb4c03", "#dc1c06", "#ff065", "#474893", "#ff3420", "#1a806b"]

    let canvas = document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    
    

    socket.on('wordcloud', data => {
      let words = generateWords(data)
      ctx.clearRect(0, 0, canvas.width = window.innerWidth, canvas.height = window.innerHeight);

      let boundedWords = almete.WordCloud(words, canvas.width, canvas.height, {
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
        fontWeight: "bold",
        rotation: 0,
        rotationUnit: "turn",
        gap: .5
      });

      boundedWords.forEach(({ centerLeft, centerTop, font, rotationRad, text }) => {
        ctx.save();
        ctx.translate(centerLeft, centerTop);
        ctx.rotate(rotationRad);
        ctx.font = font;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = random_color();
        ctx.fillText(text, 0, 0);
        ctx.restore();
      });
    })
    
    function random_color() {
        return colors[Math.round(Math.random() * colors.length)]
    }    

    function generateWords(data) {
      let words = []      
      data.map(( word, index) => {
        words[index] = { 'text':  word.words, 'weight': getWeight(word.repetition), 'rotation': radToTurn() }
      })
      
      return words
    }

    
    function radToTurn() {
      let rotation = [0, 1/8, 3/4, 7/8]
      return rotation[Math.round(Math.random() * rotation.length)]
    }

    function getWeight(repeat) {
      let fontSize = ["0", "15", "30", "45", "60", "75", "90", "105", "120", "150"]
      
      if(repeat >= 10) {
        repeat = 9
      }

      return fontSize[repeat]
    }
})(document, io, jQuery)