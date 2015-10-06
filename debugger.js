

module.exports = debung.debug(function createDebug() {
  var poly = require('ctx-render-polyline');
  var dashedLine = require('ctx-dashed-line');
  var points = require('ctx-render-points');
  var line2 = require('line2');
  var vec2 = require('vec2');

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
  var stage = window.localStorage.getItem('stage') || 0;

  var stack = [];
  var halfwidth = (width/2)|0;

  function fullClear(alpha) {
    ctx.fillStyle = "rgba(255, 127, 50," + (alpha||1) + ")";
    ctx.fillRect(0, 0, width, width)
  }

  fullClear();

  function render(obj, i) {
    if (obj) {
      ctx.save()
        ctx.translate(halfwidth, halfwidth);

        label(ctx, i, obj.method, obj.result[0] - obj.call[0]);

        if (obj.render) {
          try {
            obj.render(ctx);
          } catch (e) {
            ctx.fillStyle = "red";
            ctx.font = 'bold 16px sans-serif'
            var text = 'render: ' + e.message;
            var textWidth = ctx.measureText(e.message).width
            ctx.fillText(text, halfwidth-textWidth-20, -halfwidth + 20)
          }
        }

        if (i === stage && obj.annotate) {
          try {
            obj.annotate(ctx);
          } catch (e) {
            ctx.fillStyle = "red";
            ctx.font = 'bold 16px sans-serif'
            var text = 'annotate: ' + e.message;
            var textWidth = ctx.measureText(text).width
            ctx.fillText(text, halfwidth-textWidth-20, -halfwidth + 20)
          }
        }
      ctx.restore();
    }
  }

  function arrow(ctx, size, line) {
    var normal = vec2(line[0] - line[2], line[1] - line[3]).normalize()
    var end = vec2(line[2], line[3]);
    var left = normal.clone().rotate(Math.PI/4).multiply(size).add(end)
    var right = normal.clone().rotate(-Math.PI/4).multiply(size).add(end)

    ctx.moveTo(left.x, left.y);
    ctx.lineTo(end.x, end.y);
    ctx.lineTo(right.x, right.y);
  }

  function label(ctx, currentStage, method, timed) {
    ctx.font = "12px monospace"

    var text = currentStage + ': ' + method + ' (' + (timed).toFixed(0) + 'μs)';
    var textWidth = ctx.measureText(text).width;
    var x = -halfwidth + 10;
    var y = -halfwidth + 20;
    ctx.fillStyle = 'black';
    ctx.fillRect(-halfwidth, -halfwidth + 30, width, -30);

    ctx.fillStyle ='white';
    ctx.fillText(text, x, y);
  }

  function polygonCenterOfMass(poly) {
    if (!poly) {
      return;
    }

    var center = [0, 0];
    for (var i=0; i<poly.length; i++) {
      center[0] += poly[i][0];
      center[1] += poly[i][1];
    }

    center[0] /= poly.length;
    center[1] /= poly.length;
    return center;
  }

  function drawPlane(ctx, plane) {
    var line = line2(
      plane[0],
      plane[1],
      plane[2],
      plane[3]
    );

    var start = [0, 0], end = [0, 0];
    if (line.isVertical()) {
      start[0] = end[0] = plane[0];
      start[1] = plane[1] - width;
      end[1] = plane[1] + width;
    } else if (line.isHorizontal()) {
      start[1] = end[1] = plane[1];
      start[0] = plane[0] - width;
      end[0] = plane[0] + width;
    } else {
      var slope = line.slope();
      start[0] = line.solveForX(-width)
      start[1] = line.solveForY(start[0])
      end[0] = line.solveForX(width)
      end[1] = line.solveForY(end[0])
    }

    ctx.beginPath()
      dashedLine(ctx, start, end, 5)
      ctx.lineWidth = 3;
      ctx.strokeStyle = "black"
      ctx.stroke()
  }

  function renderStage() {
    for (var i=0; i<=stage; i++) {
      render(stages[i], i)
    }
  }

  return function debug(ctx) {
    // reset stages
    stages = [];

    debung.flow(function(d) {


      var type = d[2];
      if (type === 'wrap') {
        stack.push(d);
      } else if (type === 'unwrap') {


        var method = d[3];
        var call = stack.pop();
        var args = call[4];
        var result = d[4];

        function add(obj) {
          obj.method = method;
          obj.call = call;
          obj.result = d;
          stages.push(obj);
        }

        switch (method) {
          case 'findSide':
            add({

              render: function(ctx) {
                ctx.beginPath()
                  ctx.moveTo(args[0], args[1]);
                  ctx.lineTo(args[2], args[3]);
                  arrow(ctx, 10, args);

                ctx.lineWidth = 3;
                ctx.strokeStyle = "black"
                ctx.stroke();

                ctx.beginPath();
                  ctx.moveTo(args[4], args[5]);
                  ctx.arc(args[4], args[5], 3, 0, Math.PI*2, false);
                  ctx.fillStyle = 'white'
                  ctx.fill();
              }
            })
          break;

          case 'segline':
            add({
              render: function(ctx) {
                drawPlane(ctx, args.slice(0, 4));

                var color = d[4] ? 'green' : 'red';

                ctx.beginPath()
                  ctx.moveTo(args[4], args[5]);
                  ctx.lineTo(args[6], args[7]);

                ctx.lineWidth = 3;
                ctx.strokeStyle = color
                ctx.stroke();

                if (result) {
                  ctx.beginPath();
                    ctx.moveTo(result[0], result[1]);
                    ctx.arc(result[0], result[1], 5, 0, Math.PI*2, false);
                    ctx.fillStyle = color;
                    ctx.fill();
                }
              },
              annotate: function(ctx) {
                if (result) {
                  ctx.font = '12px monospace';
                  var text = (result[0]).toFixed(2) + ',' + (result[1]).toFixed(2);
                  var textWidth = Math.ceil(ctx.measureText(text).width);

                  var dir = (result[0] + 20 + textWidth) > halfwidth ? -1 : 1;

                  ctx.beginPath();
                    ctx.lineWidth = 1
                    ctx.moveTo(result[0] + dir * 6, result[1] - 6);
                    ctx.lineTo(result[0] + dir * 20, result[1] - 20);
                    ctx.lineTo(result[0] + dir * 20 + dir * textWidth, result[1] - 20);
                    ctx.strokeStyle = 'white';
                    ctx.stroke();

                  ctx.fillStyle = '#fff';
                  ctx.fillText(
                    text,
                    (dir < 0) ? result[0] - (20 + textWidth) : result[0] + dir * 20,
                    result[1] - 25
                  );
                }
              }
            })
          break;

          case 'drawPoly':
            add({
              render: function(ctx) {
                var polygon = args[1];

                ctx.beginPath();
                  points(ctx, 1, polygon);
                  ctx.fillStyle = 'black';
                  ctx.fill();

                ctx.lineWidth = 2;
                ctx.beginPath();
                  poly(ctx, polygon);
                ctx.closePath();
                ctx.strokeStyle = "#666"
                ctx.fillStyle = '#E0E0E0'
                ctx.stroke();
                ctx.fill();
              }
            })
          break;

          case 'clip':
            add({
              render: function(ctx) {
                var polygon = args[0];
                var plane = args[1];

                // render the results
                var rleft = result.left;
                var rright = result.right;

                var lcenter = polygonCenterOfMass(rleft)
                var rcenter = polygonCenterOfMass(rright)

                ctx.beginPath()
                  poly(ctx, rleft)
                  ctx.fillStyle = "#aaa";
                  ctx.fill()

                ctx.beginPath()
                  poly(ctx, rright)
                  ctx.fillStyle = "#777";
                  ctx.fill()

                ctx.font = "bold 16px sans-serif"
                ctx.fillStyle = 'black';
                ctx.fillText('L', lcenter[0]|0, lcenter[1]|0);
                ctx.fillText('R', rcenter[0]|0, rcenter[1]|0);

                ctx.lineWidth = 3

                ctx.beginPath();
                  points(ctx, 3, polygon);
                  ctx.fillStyle = 'rgba(' + 1 + ', 0, 0, .5)';
                  ctx.fill();

                ctx.beginPath();
                  poly(ctx, polygon);
                ctx.closePath();
                ctx.strokeStyle = "black"
                ctx.stroke()

                drawPlane(ctx, plane)
              }
            });
          break;

          default:
            // console.log('unhandled', method)
          break;
        }
      }
    });
    renderStage();

    var listening = true;
    document.addEventListener('keydown', function(e) {
      if (!listening) { return };
      var key = e.keyCode;

      switch (key) {
        // reset (r)
        case 82:
          stage = 0;
        break;

        // end (e)
        case 69:
          stage = stages.length-1;
        break;

        // jump (j)
        case 74:
          if (!e.metaKey && !e.controlKey) {
            listening = false;
            var newStage = prompt("enter stage to jump to", stage);
            stage = newStage ? newStage : stage;
            listening = true;
          }
        break;

        // left arrow key
        case 37:
          stage--;
        break;

        // right arrow key
        case 39:
          stage++;
        break;

        default:
          console.log(key);
        break;
      }

      stage = Math.max(0, Math.min(stage, stages.length-1))

      window.localStorage.setItem('stage', stage);
      fullClear();
      renderStage();
    })
  }
});


