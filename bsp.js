var fc = require('fc');
var btnode = require('./binarytreenode');

var root = new btnode({
  plane: [],
  geometry: [[-100, 200], [-100, -100], [200, -100], [200, 200]]
});

root
  .cut([0,0, 0,100], 'L')
  .cut([0,100, 100,100], 'L')
  .cut([100,100, 100,0], 'L')
  .cut([100,0, 0,0], 'L')
  .cut([50,75, 25,50], 'R')
  .cut([25,50, 50,25], 'R')
  .cut([50,25, 75,50], 'R')
  .cut([75,50, 50,75], 'R');

render('R');

function drawPoly (ctx, polygon) {
  ctx.beginPath();

  ctx.moveTo(polygon[0][0], polygon[0][1]);
  for (var i = 0; i < polygon.length; i++) {
    if (i < polygon.length - 1) {
      ctx.lineTo(polygon[i + 1][0], polygon[i + 1][1]);
    }
    else {
      ctx.lineTo(polygon[0][0], polygon[0][1]);
    }
  }
  ctx.closePath();

  ctx.fillStyle = 'rgba(0, 0, 0, .1)';
  ctx.strokeStyle = 'black';
  ctx.stroke();
  ctx.fill();
}

function render (side) {
  var polygons = [];

  function renderIterator (context, currentDepth, branch, parent) {
    if (!context) return;
    // am I on the left side and without children? render me!
    if (!context.leftChild && !context.rightChild ) {
      if (context.data && context.data.geometry && context.data.geometry.length > 0) {
        // are we the left child?
        switch (side) {
          case 'L':
            if (parent.leftChild === context) {
              polygons.push(context.data.geometry);
            }
          break;

          case 'R':
            if (parent.rightChild === context) {
              polygons.push(context.data.geometry);
            }
          break;

          default:
            polygons.push(context.data.geometry);
          break;
        }
      }
    }
  }

  function renderCompleted () {
    var ctx = fc(function () {
      ctx.translate(200, 200);
      for (var j = 0; j < polygons.length; j++) {
        drawPoly(ctx, polygons[j]);
      }
    });

    ctx.dirty();
  }

  root.traverse(renderIterator, 0, '-', this, renderCompleted);
}
