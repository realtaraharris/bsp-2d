var tape = require('tape');
var clipper = require('./clip').clip;

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

  t.end();
});
