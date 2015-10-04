var latestId = 0;
var clip = require('./clip').clip;
var nick = require('./clip').nick;

function BinaryTreeNode (data, id, parent, side) {
  this.leftChild = null;
  this.rightChild = null;
  this.parent = parent;
  this.data = data;
  this.side = side;
  this.id = ('undefined' === typeof id) ? latestId++ : id;
}

BinaryTreeNode.prototype.addLeftChild = function (data, parent) {
  this.leftChild = new BinaryTreeNode(data, undefined, parent, 'L');

  return this.leftChild;
};

BinaryTreeNode.prototype.addRightChild = function (data, parent) {
  this.rightChild = new BinaryTreeNode(data, undefined, parent, 'R');

  return this.rightChild;
};

// BinaryTreeNode.prototype.nick = function () {
//   var nickingPlanes = [];
//   if (this.isLeaf()) {
//     if (this.leftChild && this.leftChild.data.plane) {
//       nickingPlanes.push(this.leftChild.data.plane);
//     }

//     if (this.rightChild && this.rightChild.data.plane) {
//       nickingPlanes.push(this.rightChild.data.plane);
//     }
//   }
// }

BinaryTreeNode.prototype.cut = function (cuttingPlane, side) {
  var geo = clip(this.data.geometry, cuttingPlane);

  this.data.plane = cuttingPlane;

  if (this.isLeaf()) {
    this.addLeftChild({geometry: geo.left, plane: [], edges: geo.edges}, this);
    this.addRightChild({geometry: geo.right, plane: [], edges: geo.edges}, this);

    if (side === 'L') {
      return this.leftChild;
    }
    else {
      return this.rightChild;
    }
  } else {
    console.error('not a leaf node!')
  }

  // are we entirely on the left or right? pass the cuttingPlane down the tree
  if ((geo.left.length === 0) && (geo.right.length > 0)) {
    this.rightChild.cut(cuttingPlane);
  }
  else if ((geo.left.length > 0) && (geo.right.length === 0)) {
    this.leftChild.cut(cuttingPlane);
  }
};

BinaryTreeNode.prototype.isLeaf = function () {
  return null === this.leftChild && null === this.rightChild;
};

BinaryTreeNode.prototype.traverse = function (renderIterator, currentDepth, branch, renderCompleted) {
  renderIterator(this, currentDepth, branch);

  currentDepth++; // important to do this before recursing into either child

  if (this.rightChild) {
    this.rightChild.traverse(renderIterator, currentDepth, 'R');
  }

  if (this.leftChild) {
    this.leftChild.traverse(renderIterator, currentDepth, 'L' );
  }

  if (renderCompleted) {
    renderCompleted();
  }
};

module.exports = BinaryTreeNode;
