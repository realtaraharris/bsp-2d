var tape = require('tape');
var findSide = require('./find-side');

tape('check line side finder', function (t) {
  t.equals(findSide(1, 0, 0, 0, -1, -1), 1, "1");
  t.equals(findSide(25, 0, 0, 0, -1, -14), 1, "1.1");
  t.equals(findSide(25, 20, 0, 20, -1, 6), 1, "1.2");
  t.equals(findSide(24, 20, -1, 20, -2, 6), 1, "1.3");

  t.equals(findSide(1, 0, 0, 0, 1, 1), -1, "-1");
  t.equals(findSide(12, 0, 0, 0, 2, 1), -1, "-1.1");
  t.equals(findSide(-25, 0, 0, 0, -1, -14), -1, "-1.2");
  t.equals(findSide(1, 0.5, 0, 0, 1, 1), -1, "-1.3");

  t.equals(findSide(0,5, 1,10, 10,20), -1, "2.1");
  t.equals(findSide(0,9.1, 1,10, 10,20), 1, "2.2");
  t.equals(findSide(0,5, 1,10, 20,10), -1, "2.3");
  t.equals(findSide(0,9.1, 1,10, 20,10), -1, "2.4");

  t.equals(findSide(1,1, 1,10, 0,0), 1, "vertical 1");
  t.equals(findSide(1,10, 1,1, 0,0), -1, "vertical 2");
  t.equals(findSide(1,1, 1,10, 5,0), -1, "vertical 3");
  t.equals(findSide(1,10, 1,1, 5,0), 1, "vertical 3");

  t.equals(findSide(1,-1, 10,-1, 0,0), 1, "horizontal 1");
  t.equals(findSide(10,-1, 1,-1, 0,0), -1, "horizontal 2");
  t.equals(findSide(1,-1, 10,-1, 0,-9), -1, "horizontal 3");
  t.equals(findSide(10,-1, 1,-1, 0,-9), 1, "horizontal 4");

  t.equals(findSide(0,0, 10,10, 1,2), 1, "positive slope 1");
  t.equals(findSide(10,10, 0,0, 1,2), -1, "positive slope 2");
  t.equals(findSide(0,0, 10,10, 1,0), -1, "positive slope 3");
  t.equals(findSide(10,10, 0,0, 1,0), 1, "positive slope 4");

  t.equals(findSide(0,0, -10,10, 1,2), -1, "negative slope 1");
  t.equals(findSide(0,0, -10,10, 1,2), -1, "negative slope 2");
  t.equals(findSide(0,0, -10,10, -1,-2), 1, "negative slope 3");
  t.equals(findSide(-10,10, 0,0, -1,-2), -1, "negative slope 4");

  t.equals(findSide(1, 0, 0, 0, -1, 0), 0, "0");
  t.equals(findSide(0,0, 0, 0, 0, 0), 0, "1");
  t.equals(findSide(0,0, 0,1, 0,2), 0, "2");
  t.equals(findSide(0,0, 2,0, 1,0), 0, "3");
  t.equals(findSide(1, -2, 0, 0, -1, 2), 0, "4");

  t.end();
});
