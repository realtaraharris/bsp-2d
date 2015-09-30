var latestId = 0;
var clip = require('./clip').clip;
var nick = require('./clip').nick;

function BinaryTreeNode (data, id) {
  this.leftChild = null;
  this.rightChild = null;
  this.data = data;
  this.id = ('undefined' === typeof id) ? latestId++ : id;
}

BinaryTreeNode.prototype.addLeftChild = function (data) {
  this.leftChild = new BinaryTreeNode(data);

  return this.leftChild;
};

BinaryTreeNode.prototype.addRightChild = function (data) {
  this.rightChild = new BinaryTreeNode(data);

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

  if (this.isLeaf()) {
    this.addLeftChild({geometry: geo.left, plane: cuttingPlane});
    this.addRightChild({geometry: geo.right, plane: cuttingPlane});

    if (side === 'L') {
      return this.leftChild;
    }
    else {
      return this.rightChild;
    }
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

BinaryTreeNode.prototype.traverse = function (renderIterator, parent, currentDepth, branch, renderCompleted) {
  renderIterator(this, parent, currentDepth, branch);

  currentDepth++; // important to do this before recursing into either child

  if (this.leftChild) {
    this.leftChild.traverse(renderIterator, this, currentDepth, 'L' );
  }

  if (this.rightChild) {
    this.rightChild.traverse(renderIterator, this, currentDepth, 'R');
  }

  if (renderCompleted) {
    renderCompleted();
  }
};

module.exports = BinaryTreeNode;
