
module.exports = debung.debug(function createDebug() {
  var wraps = ['findSide']
  var width = 500;
  var overlay = document.createElement('div')
  overlay.style.position = 'absolute'
  overlay.style.width = width + 'px'
  overlay.style.right = 0;
  // overlay.style.border = "1px solid black"

  document.body.appendChild(overlay)

  var c = document.createElement('canvas');
  c.width = width-10;
  c.height = width-10;
  c.style.margin = '5px'
  overlay.appendChild(c);

  var ctx = c.getContext('2d');
  var stages = [];
  var stack = [];
  var halfwidth = (width/2)|0;
  function render(fn) {
    ctx.save()
      ctx.fillStyle = "orange";
      ctx.fillRect(0, 0, width, width)
      ctx.translate(()|0, (width/2)|0);
      fn(ctx);
    ctx.restore();
  }

  return function debug(ctx) {
    debung.flow(function(d) {
      var type = d[2];
      if (type === 'wrap') {
        stack.push(d);
      } else if (type === 'unwrap') {
        var method = d[3];
        var call = stack.pop();

        switch (method) {
          case 'findSide':
            stages.push(function(ctx) {
              ctx.fillStyle = "black"
              ctx.fillText(method, 0, 10);
              var args = call[4];
              ctx.beginPath()
                ctx.moveTo(args[0], args[1]);
                ctx.lineTo(args[2], args[3]);
                ctx.lineTo(args[4], args[5]);

              ctx.lineWidth = 3;
              ctx.strokeStyle = "black"
              ctx.stroke();
            })

          break;

          case 'segline':

            stages.push(function(ctx) {
              console.log('here?')
              ctx.fillText(method, , 10);
              var args = call[4];
              console.log(args);
              ctx.beginPath()
                ctx.moveTo(args[0], args[1]);
                ctx.lineTo(args[2], args[3]);
                ctx.lineTo(args[4], args[5]);

              ctx.lineWidth = 3;
              ctx.strokeStyle = "black"
              ctx.stroke();
            })


          break;


          default:
            console.log(method)
          break;
        }



      }
    });

    var stage = 0;
    render(stages[stage])

    document.addEventListener('keydown', function(e) {
      var key = e.keyCode;

      switch (key) {
        // left
        case 37:
          stage--;
        break;

        case 39:
          stage++;
        break;

        default:
          console.log(key);
        break;
      }

      stage = Math.min(Math.max(stage, 0), stages.length-1)

      stages[stage] && render(stages[stage])
    })
  }
});


