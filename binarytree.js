var Geometry = require('gl-geometry');
var BinaryTreeNode = require('./binarytreenode');

function BinaryTree (root) {
  if (root) {
    this.root = root;
  }
}

BinaryTree.prototype.reparent = function (binaryTreeNode, op, side) {
  var tmp = new BinaryTreeNode(op);

  if (side === BinaryTree.LEFT) {
    tmp.leftChild = this.root;
    tmp.rightChild = binaryTreeNode;
    this.root = tmp;
  }
  else if (side === BinaryTree.RIGHT) {
    tmp.leftChild = binaryTreeNode;
    tmp.rightChild = this.root;
    this.root = tmp;
  }
  else {
    console.error('invalid side chosen; \'side\' must be 0 (left) or 1 (right), not:', side);
  }
};

BinaryTree.prototype.render = function (sketchShader, gl, projection, view, model) {
  if (!this.root) return;

  var temp = this.root.csg();

  var boolGeometry = Geometry(gl);

  boolGeometry.attr('aPosition', temp.points.map(function (pt) { return [pt[0], pt[1], 0]; } ));
  boolGeometry.faces(temp.red.concat(temp.blue), { size: 2 });

  boolGeometry.bind(sketchShader);
  sketchShader.uniforms.uProjection = projection;
  sketchShader.uniforms.uView = view;
  sketchShader.uniforms.uModel = model;
  gl.lineWidth(1);
  boolGeometry.draw(gl.LINES);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  boolGeometry.unbind();
};

BinaryTree.prototype.renderTest = function (testcb) {
  if (!this.root || !testcb) return;

  var tmp = [];
  this.root.traverse(
    function callback (node, currentDepth, branch, parentId) {
      tmp.push({ data: node.data, id: node.id, branch: branch, parentId: parentId });
    },
    0,
    'ROOT',
    this.root.id,
    function done () {
      testcb(tmp);
    }
  );
};

BinaryTree.LEFT = 0;
BinaryTree.RIGHT = 1;

module.exports = BinaryTree;
