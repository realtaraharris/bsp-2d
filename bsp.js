var fc = require('fc');
var btnode = require('./binarytreenode');
var nick = require('./clip').nick;

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

render('R'); // try 'L', 'R', or '-'

function drawPoly (ctx, polygon) {
  ctx.moveTo(polygon[0][0], polygon[0][1]);
  for (var i = 0; i < polygon.length; i++) {
    ctx.beginPath();
    ctx.arc(polygon[i][0], polygon[i][1], 4, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(' + 1 + ', 0, 0, ' + (i+1) *.15 + ')';
    ctx.closePath()
    ctx.fill();
  }

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

  function renderIterator (context) {
    if (context && context.isLeaf()) {
      switch (side) {
        case 'L':
          if (context.side === 'L') {
            var relative = context.parent.rightChild.rightChild;
            var cuttingPlane = relative ? relative.data.plane : [];
            polygons.push(nick(context.data.geometry, cuttingPlane));
          }
        break;

        case 'R':
          if (context.side === 'R') {
            var relative = context.parent.leftChild.leftChild;
            var cuttingPlane = relative ? relative.data.plane : [];
            polygons.push(nick(context.data.geometry, cuttingPlane));
          }
        break;

        default:
          polygons.push(context.data.geometry);
        break;
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

  root.traverse(renderIterator, 0, '-', renderCompleted);
}
