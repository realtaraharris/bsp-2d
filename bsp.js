var fc = require('fc');
var btnode = require('./binarytreenode');
var debug = require('./debugger');
var arc = require('subdivide-arc');

// var root = new btnode(
//   {
//     plane: [],
//     geometry: [[-100, 200], [-100, -100], [200, -100], [200, 200]]
//   },
//   0, undefined, '-'
// );

//circle(root, 20);
// diamondHole(root);

  function createRoot() {
    return new btnode(
      {
        plane: [],
        geometry: [[-100, 200], [-100, -100], [200, -100], [200, 200]]
      },
      undefined, undefined, '-'
    );
  }

  function square () {
    var tmproot = createRoot()
    tmproot
      .cut([0,0, 0,100], 'L')
      .cut([0,100, 100,100], 'L')
      .cut([100,100, 100,0], 'L')
      .cut([100,0, 0,0], 'L')
    return tmproot;
  }

  function diamond () {
    var tmproot = createRoot();
    tmproot
      .cut([50,75, 25,50], 'R')
      .cut([25,50, 50,25], 'R')
      .cut([50,25, 75,50], 'R')
      .cut([75,50, 50,75], 'R');
    return tmproot;
  }

  var root = square().merge(diamond())
  console.log('ROOT:', root);


// function diamondHole (tree) {
//   tree
//     .cut([0,0, 0,100], 'L')
//     .cut([0,100, 100,100], 'L')
//     .cut([100,100, 100,0], 'L')
//     .cut([100,0, 0,0], 'L')
//     .cut([50,75, 25,50], 'R')
//     .cut([25,50, 50,25], 'R')
//     .cut([50,25, 75,50], 'R')
//     .cut([75,50, 50,75], 'R');
// }

function circle (tree, count) {
  var arcpoints = arc(50, 50, 90, 0, Math.PI*2, count)
  var currentPoint = arcpoints[0]
  for (var i = 1; i < count; i++) {
    var nextPoint = arcpoints[i];
    tree = tree.cut([
      currentPoint[0],
      currentPoint[1],
      nextPoint[0],
      nextPoint[1]
    ], 'R')
    currentPoint = nextPoint;
  }
}

render('-'); // try 'L', 'R', or '-'

function drawPoly (ctx, polygon) {
  ctx.moveTo(polygon[0][0], polygon[0][1]);
  for (var i = 0; i < polygon.length; i++) {
    ctx.beginPath();
    ctx.arc(polygon[i][0], polygon[i][1], 1, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(' + 1 + ', 0, 0, ' + (i+1) *0.15 + ')';
    ctx.closePath()
    ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(polygon[0][0], polygon[0][1]);

  for (var k = 0; k < polygon.length; k++) {
    if (k < polygon.length - 1) {
      ctx.lineTo(polygon[k + 1][0], polygon[k + 1][1]);
    }
  }
  ctx.closePath();

  ctx.fillStyle = 'rgba(0, 0, 0, .1)';
  ctx.strokeStyle = 'rgba(0, 0, 0, .1)'
  ctx.stroke();
  ctx.fill();
}

function render (side) {
  var polygons = [];

  function renderIterator (context) { // TODO: rename `context` -> `node`
    var sibling;
    if (context.side === 'L') {
      sibling = context.parent.rightChild;
    }
    else if (context.side === 'R') {
      sibling = context.parent.leftChild;
    }
    else {
      if (context.id === 0) {
        console.log('root node has no sibling');
        console.log('root node:', context)
        sibling = context;
      }
      else {
        console.error('could not find sibling');
      }
    }

    if (context && context.isLeaf() && ((context.side === side) || (side === '-'))) {
      if (sibling) {
        var cedges = context.data.edges;
        var redges = sibling.data.edges;
        // console.log('cedges:', cedges);
        // console.log('redges:', redges);
        // console.log('plane:', sibling.data.plane);
      }

      polygons.push(context.data.geometry);
    }
    else {
//      console.log('nope:', context, side);
    }
  }

  function renderCompleted () {
    var ctx = fc(function () {
      ctx.translate(200, 200);
      for (var j = 0; j < polygons.length; j++) {
        drawPoly(ctx, polygons[j]);
      }

      debug(ctx)

    });

    ctx.dirty();

  }

  root.traverse(renderIterator, 0, '-', renderCompleted);
}
