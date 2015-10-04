

module.exports = debung.debug(function createDebug() {
  var poly = require('ctx-render-polyline');
  var dashedLine = require('ctx-dashed-line');
  var points = require('ctx-render-points');
  var line2 = require('line2');
  var vec2 = require('vec2');
  var Polygon = require('polygon');
  var cdt2d = require('cdt2d');
  var incenter = require('triangle-centroid');
  var voronoi = require('voronoi-diagram')
  var seg2 = require('segment2')

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
      ctx.translate(halfwidth, halfwidth);
      fn(ctx);
    ctx.restore();
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

  function label(ctx, method, timed) {
    ctx.fillStyle ='black';
    ctx.font = "12px monospace"

    ctx.fillText('method: ' + method + ' (' + timed + 'ms)', -halfwidth + 10, -halfwidth + 20);
  }

  function polygonCenterOfMass(poly) {
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
      ctx.strokeStyle = "grey"
      ctx.stroke()
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

        switch (method) {
          case 'findSide':
            stages.push(function(ctx) {
              label(ctx, method, d[0] - call[0]);
              var args = call[4];

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
            })

          break;

          case 'segline':

            stages.push(function(ctx) {
              label(ctx, method, d[0] - call[0]);
              var args = call[4];
              var result = d[4];

              console.log(result)

              drawPlane(ctx, args.slice(0, 4));

              var color = d[4] ? 'green' : 'red';

              ctx.beginPath()
                ctx.moveTo(args[4], args[5]);
                ctx.lineTo(args[6], args[7]);

              ctx.lineWidth = 3;
              ctx.strokeStyle = color
              ctx.stroke();

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


                ctx.beginPath();
                  ctx.moveTo(result[0], result[1]);
                  ctx.arc(result[0], result[1], 5, 0, Math.PI*2, false);
                  ctx.fillStyle = color;
                  ctx.fill();
              }
            })
          break;

          case 'drawPoly':
            stages.push(function(ctx) {
              label(ctx, method, d[0] - call[0]);
              var polygon = call[4][1];

              ctx.beginPath();
                points(ctx, 3, polygon);
                ctx.fillStyle = 'rgba(' + 1 + ', 0, 0, .5)';
                ctx.fill();

              ctx.beginPath();
                poly(ctx, polygon);
              ctx.closePath();
              ctx.strokeStyle = "grey"
              ctx.stroke()

            })
          break;

          case 'clip':
            stages.push(function(ctx) {
              label(ctx, method, d[0] - call[0]);
              var polygon = call[4][0];
              var plane = call[4][1];

              // render the results
              var result = d[4];
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

            });
          break;

          default:
            console.log('unhandled', method)
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


