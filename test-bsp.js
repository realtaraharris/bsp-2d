var test = require('tape');
var btnode = require('./binarytreenode');

test('test bsp tree merge', function (t) {

  function createRoot() {
    return new btnode(
      {
        plane: [],
        geometry: [[-100, 200], [-100, -100], [200, -100], [200, 200]]
      },
      0, undefined, '-'
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

  var result = square().merge(diamond())
  console.log(result);

//   var s = square();
//   console.log('s.isRoot():', s.isRoot());
//   var d = diamond();
//   console.log('d.isRoot():', d.isRoot());
//   // console.log(result);

// s.merge(d);

  t.end();
})
