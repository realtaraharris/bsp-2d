var fc = require('fc');
var btnode = require('./binarytreenode');
var nick = require('./clip').nick;

var cleanPSLG = require('clean-pslg');
var poly2pslg = require('poly-to-pslg');
var pslg2poly = require('pslg-to-poly');
var arc = require('subdivide-arc');

var root = new btnode({
  plane: [],
  geometry: [[-100, 200], [-100, -100], [200, -100], [200, 200]]
});

var current = root
  // .cut([0,0, 0,100], 'L')
  // .cut([0,100, 100,100], 'L')
  // .cut([100,100, 100,0], 'L')
  // .cut([100,0, 0,0], 'L')
  // .cut([50,75, 25,50], 'R')
  // .cut([25,50, 50,25], 'R')
  // .cut([50,25, 75,50], 'R')
  // .cut([75,50, 50,75], 'R');

var count = 10;
var arcpoints = arc(50, 50, 90, 0, Math.PI*2, count)
var currentPoint = arcpoints[0]
for (var i=1; i<count; i++) {
  var nextPoint = arcpoints[i];
  current = current.cut([
    currentPoint[0],
    currentPoint[1],
    nextPoint[0],
    nextPoint[1]
  ], '-')
  currentPoint = nextPoint;
}

render('-'); // try 'L', 'R', or '-'
//renderPslg('L'); // try 'L', 'R', or '-'

function drawPslg (ctx, pslg) {
console.log('pslg:',pslg)
  ctx.beginPath();
  for (var i = 0; i < pslg.edges.length; i++) {
    var pt1 = pslg.points[pslg.edges[i][0]];
    var pt2 = pslg.points[pslg.edges[i][1]];
//    ctx.moveTo(pt1[0], pt1[1]);
    ctx.lineTo(pt2[0], pt2[1]);
  }
  ctx.fillStyle = 'rgba(200, 255, 0, 0.5)';
  ctx.strokeStyle = 'rgba(1, 20, 0, 0.5)';
  ctx.closePath()
  ctx.stroke();
  ctx.fill();
}

function drawPoly (ctx, polygon) {
  ctx.moveTo(polygon[0][0], polygon[0][1]);
  for (var i = 0; i < polygon.length; i++) {
    ctx.beginPath();
    ctx.arc(polygon[i][0], polygon[i][1], 1, 0, 2 * Math.PI, false);
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
  }
  ctx.closePath();

  ctx.fillStyle = 'rgba(0, 0, 0, .1)';
  ctx.strokeStyle = 'rgba(0, 0, 0, .1)'
  ctx.stroke();
  // ctx.fill();
}

function render (side) {
  var polygons = [];

  function renderIterator (context) {
    var relative;
    if ((context.side === 'L') && (side === 'L')) {
      relative = context.parent.rightChild.rightChild;
    } else if ((context.side === 'R') && (side === 'R')) {
      relative = context.parent.leftChild.leftChild;
    }
/*
    else {
      console.log('meh')
    }
*/

// console.log('---------------------')
console.log('!!! context:', context)
// console.log('---------------------')

console.log('relative:', relative)
    if (context && context.isLeaf() && ((context.side === side) || (side === '-'))) {
      // if (!relative) {
      //   return console.log(context, side);
      // }

      if (relative) {
        var cedges = context.data.edges;
        var redges = relative.data.edges;
        console.log('cedges, redges:', cedges, redges)
      }
      // console.log(context)
      // console.log('relative:', relative)

      polygons.push(context.data.geometry);
    }
    else {
      // console.log('fuuuuuuuu', context, side)
    }
  }

  function renderCompleted () {
    var ctx = fc(function () {
      ctx.translate(200, 200);
      var foo = 0;
      //for (var j = foo; j < polygons.length; j++) {
      for (var j = 0; j < polygons.length; j++) {
        drawPoly(ctx, polygons[j]);
        //if (j === foo) return;
      }
    });

    ctx.dirty();
  }

  root.traverse(renderIterator, 0, '-', renderCompleted);
}


function renderPslg (side) {
  var polygons = [];

  function renderIterator (context) {
    if (context && context.isLeaf() && (context.side === side) || (side === '-')) {
      var cedges = context.data.edges;
      var sedges = side
      polygons.push(context.data.geometry);
    }
  }

  function renderCompleted () {
    var pslg = poly2pslg(polygons) ; // , { clean: true });
    //polygons = pslg2poly(pslg.points, pslg.edges);

    var ctx = fc(function () {
      ctx.translate(200, 200);
      // for (var j = 0; j < polygons.length; j++) {
        drawPslg(ctx, pslg); // polygons[j]);
      //   if (j === 0) return;
      // }
    });

    ctx.dirty();
  }

  root.traverse(renderIterator, 0, '-', renderCompleted);
}
