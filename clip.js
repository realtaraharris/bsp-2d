var findSide = require('./find-side');

// determine the intersection point of a line segment with a line
// original: http://paulbourke.net/geometry/pointlineplane/pdb.c
var EPS = 0.000001;

function segline(x1, y1, x2, y2, x3, y3, x4, y4) {
  var denom  = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  var numera = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
  var numerb = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);

  // are the line coincident?
  if (Math.abs(numera) < EPS && Math.abs(numerb) < EPS && Math.abs(denom) < EPS) {
    return [
      (x1 + x2) / 2,
      (y1 + y2) / 2
    ];
  }

  // are the line parallel?
  if (Math.abs(denom) < EPS) {
    return; // no intersection
  }

  // is the intersection along the the segment?
  return [
    x1 + (numera / denom) * (x2 - x1),
    y1 + (numera / denom) * (y2 - y1)
  ]
}

function clip (poly, cuttingPlane, nickingPlanes) {
  var left = [];
  var right = [];

  var lastPointSide;
  if (!poly || !poly[0]) return {left: undefined, right: undefined};

  for (var i = 0; i < poly.length + 1; i++) {
    var currentX;
    var currentY;

    if (i === poly.length) { // handle last line segment
      currentX = poly[0][0];
      currentY = poly[0][1];
    }
    else {
      currentX = poly[i][0];
      currentY = poly[i][1];
    }
    var side = findSide(cuttingPlane[0], cuttingPlane[1], cuttingPlane[2], cuttingPlane[3], currentX, currentY);

    // does the current line segment intersect the cuttingPlane?
    if (
      (lastPointSide !== 0) // we didn't hit the thing right on the head
      && (side !== 0)
      && (side !== lastPointSide)
      && (i < poly.length + 1)
      && (i > 0)
    ) {
      var lastX = poly[i - 1][0];
      var lastY = poly[i - 1][1];

      var intersection = segline(cuttingPlane[0], cuttingPlane[1], cuttingPlane[2], cuttingPlane[3], currentX, currentY, lastX, lastY);

      if (Array.isArray(intersection)) {
        left.push([intersection[0], intersection[1]]);
        right.push([intersection[0], intersection[1]]);
      }
    }

    // TODO: wow, this is broken
    if ('undefined' !== typeof poly[i]) {
      if (side < 0) {
        left.push(poly[i]);
      }
      else if (side === 0) {
        left.push(poly[i]);
        right.push(poly[i]);
      }
      else {
        right.push(poly[i]);
      }
    }

    // set lastPointSide for next iteration
    lastPointSide = side;
  }

  return {
    left: left,
    right: right
  }
}

module.exports = clip;
