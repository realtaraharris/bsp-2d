var latestId = 0;
var clip = require('./clip');

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

BinaryTreeNode.prototype.cut = function (plane, side) {
  var geo = clip(this.data.geometry, plane);

  // if we're in a terminal node, make children
  if (!this.leftChild && !this.rightChild) {
    this.addLeftChild({geometry: geo.left});
    this.addRightChild({geometry: geo.right});

    if (side === 'L') {
      return this.leftChild;
    }
    else {
      return this.rightChild;
    }
  }

  // are we entirely on the left or right?
  if ((geo.left.length === 0) && (geo.right.length > 0)) {
    this.rightChild.cut(plane);
  }
  else if ((geo.left.length > 0) && (geo.right.length === 0)) {
    this.leftChild.cut(plane);
  }
  else {

  }
}

BinaryTreeNode.prototype.isLeaf = function () {
  return null === this.leftChild && null === this.rightChild;
};

// TODO: get rid of parentId, use parent.id instead
BinaryTreeNode.prototype.traverse = function (callback, currentDepth, branch, parentId, parent, done) {
  callback(this, currentDepth, branch, parentId, parent);

  currentDepth++; // important to do this before recursing into either child

  if (this.leftChild) {
    this.leftChild.traverse(callback, currentDepth, 'L', this.id, this);
  }

  if (this.rightChild) {
    this.rightChild.traverse(callback, currentDepth, 'R', this.id, this);
  }

  if (done) {
    done();
  }
};

module.exports = BinaryTreeNode;
