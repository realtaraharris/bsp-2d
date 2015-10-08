var tape = require('tape');
var clipper = require('./clip').clip;
var lineline = require('./clip').lineline;

tape('check convex polygon clipper', function (t) {
  t.deepEquals(
    clipper([[0,0], [0,1], [1,1], [1,0]], [-0.25, 0.25, 0.75, 1.25]),
    {
      left: [ [ 0, 0 ], [0, 0.5], [0.5, 1], [ 1, 1 ], [ 1, 0 ] ],
      right: [ [0, 0.5], [ 0, 1 ], [0.5, 1] ]
    },
    'clipped a triangle off the corner'
  );

  t.deepEquals(
    clipper([[0,0], [0,1], [1,1], [1,0]], [-1, -1, 2, 2]),
    {
      left: [ [ 0, 0 ], [ 1, 1 ], [ 1, 0 ] ],
      right: [ [ 0, 0 ], [0, 1], [1, 1] ]
    },
    'clipped through corner points diagonally'
  );

  t.deepEquals(
    clipper([[0,0], [0,1], [1,1], [1,0]], [-10, 0, 0, 20]),
    {
      left: [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ] ],
      right: [ ]
    },
    'clipped through one side'
  );

  t.deepEquals(
    clipper([[0,0], [0,1], [1,1], [1,0]], [10, 20, 10, 21]),
    {
      left: [ ],
      right: [ [ 0, 0 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0 ] ]
    },
    'clipped through other side'
  );

  t.deepEquals(
    clipper([[0,0], [0,1], [1,1], [1,0]], [-0.1, 0.5, 1.1, 0.5]),
    {
      left: [ [ 0, 0 ], [ 0, 0.5 ], [ 1, 0.5 ], [ 1, 0 ] ],
      right: [ [ 0, 0.5 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0.5 ] ]
    },
    'clipped through horizontal line'
  );

  t.deepEquals(
    clipper([[0,0], [0,1], [1,1], [1,0]], [0.5, -1, 0.5, 2]),
    {
      left: [ [ 0.5, 0 ], [ 0.5, 1 ], [ 1, 1 ], [ 1, 0 ] ],
      right: [ [ 0.5, 0 ], [ 0, 0 ], [ 0, 1 ], [ 0.5, 1 ] ]
    },
    'clipped through vertical line'
  );

  t.deepEquals(
    clipper([[0,0], [0,1], [1,1], [1,0]], [0.1, 0.5, 0.9, 0.5]),
    {
      left: [ [ 0, 0 ], [ 0, 0.5 ], [ 1, 0.5 ], [ 1, 0 ] ],
      right: [ [ 0, 0.5 ], [ 0, 1 ], [ 1, 1 ], [ 1, 0.5 ] ]
    },
    'clipped through horizontal line (defined by interior points)'
  );

  t.deepEquals(
    clipper([[0,0], [0,1], [1,1], [1,0]], [0.5, 0.1, 0.5, 0.9]),
    {
      left: [ [ 0.5, 0 ], [ 0.5, 1 ], [ 1, 1 ], [ 1, 0 ] ],
      right: [ [ 0.5, 0 ], [ 0, 0 ], [ 0, 1 ], [ 0.5, 1 ] ]
    },
    'clipped through vertical line (defined by interior points)'
  );

  t.equals(lineline(0,0,1,1, 1,0,2,1), true, '45 degree lines pointing northeast');
  t.equals(lineline(0,0,0,1, 1,0,1,1), true, 'vertical lines check out');
  t.equals(lineline(0,0,1,0, 0,1,1,1), true, 'horizontal lines');
  t.deepEquals(lineline(0,0,0,1, -0.5,0.5,0.5,0.5), [ 0, 0.5 ], 'cross with center at (0,0.5)');

  t.deepEquals(lineline(0, 100, 100, 100, 25, 50, 50, 25), [ -25, 100 ], '');
  t.deepEquals(lineline(100, 100, 100, 0, 25, 50, 50, 25), [ 100, -25 ], '');
  t.deepEquals(lineline(100, 0, 0, 0, 25, 50, 50, 25), [ 75, 0 ], '');

  //     .cut([0,0, 0,100], 'L')
  //     .cut([0,100, 100,100], 'L')
  //     .cut([100,100, 100,0], 'L')
  //     .cut([100,0, 0,0], 'L')
  // }

  // function diamond () {
  //   return createRoot()
  //     .cut([50,75, 25,50], 'R')
  //     .cut([25,50, 50,25], 'R')
  //     .cut([50,25, 75,50], 'R')
  //     .cut([75,50, 50,75], 'R');



  t.end();
});
