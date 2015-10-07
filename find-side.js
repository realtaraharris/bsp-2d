// original implementation by Al Globus, http://stackoverflow.com/questions/1560492/how-to-tell-whether-a-point-is-to-the-right-or-left-side-of-a-line

// return integer code for which side of the line ab c is on
// 1 means left turn, -1 means right turn.
// returns 0 if all three are on a line

var EPS = 0.00000001;

function findSide (ax, ay, bx, by, cx, cy) {
  // vertical line
  if (nearlyEqual(bx - ax, 0, EPS)) {
    if (cx < bx) {
      return by > ay ? 1 : -1;
    }
    if (cx > bx) {
      return by > ay ? -1 : 1;
    }
    return 0;
  }

  // horizontal line
  if (nearlyEqual(by - ay, 0, EPS)) {
    if (cy < by) {
      return bx > ax ? -1 : 1;
    }
    if (cy > by) {
      return bx > ax ? 1 : -1;
    }
    return 0;
  }

  var slope = (by - ay) / (bx - ax);
  var yIntercept = ay - ax * slope;
  var cSolution = (slope * cx) + yIntercept;

  if (slope !== 0) {
    if (cy > cSolution) {
      return bx > ax ? 1 : -1;
    }
    if (cy < cSolution) {
      return bx > ax ? -1 : 1;
    }
    return 0;
  }
  return 0;
}

// http://stackoverflow.com/questions/3874627/floating-point-comparison-functions-for-c-sharp
function nearlyEqual (a, b, epsilon) {
  var diff = Math.abs(a - b);

  if (a === b) {
    return true;
  }
  else if (a === 0 || b === 0) {
    return diff < epsilon;
  }
  else {
    return diff / (Math.abs(a) + Math.abs(b)) < epsilon;
  }
}

module.exports = findSide;
