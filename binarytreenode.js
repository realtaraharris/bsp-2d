var latestId = 0;
var clip = require('./clip').clip;
var nick = require('./clip').nick;
var lineline = require('./clip').lineline;
var findSide = require('./find-side');

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

BinaryTreeNode.prototype.isRoot = function () {
console.log('isRoot...', !this.parent);
  return !this.parent;
}

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

BinaryTreeNode.prototype.clone = function(parent) {
  var ret = new BinaryTreeNode({
    // TODO: do a deep clone of geometry
    geometry: this.data.geometry,
    plane: this.data.plane.slice(),
    edges: this.data.edges.slice()
  }, 'clone-' + this.id, parent || undefined, this.side);
  if (this.leftChild) {
    ret.leftChild = this.leftChild.clone(ret)
  }

  if (this.rightChild) {
    ret.leftChild = this.rightChild.clone(ret)
  }
  return ret;
}

BinaryTreeNode.prototype.merge = function (foreignTree) {
  if (this.isRoot()) {
    // TODO: handle the case where the foreignTree is not root

    // TODO: make tree regular by having plane in root node!
    this.leftChild.merge(foreignTree.leftChild);
    this.leftChild.merge(foreignTree.rightChild);
    this.rightChild.merge(foreignTree.leftChild);
    this.rightChild.merge(foreignTree.rightChild);
    return this;
  }

  if (foreignTree.isLeaf()) {
    console.log('ignoring foreignTree');
    return this;
  }

  // TODO: append a clone of foreignTree to this leaf.. which side though?
  if (this.isLeaf()) {
    var node = foreignTree.clone(this);
    this.rightChild = node;
    return this;
  }

  // console.log('in merge, at the top, this:', this)
  // console.log('in merge, at the top, foreignTree:', foreignTree)

  var x1 = this.data.plane[0];
  var y1 = this.data.plane[1];
  var x2 = this.data.plane[2];
  var y2 = this.data.plane[3];

  var x3 = foreignTree.data.plane[0];
  var y3 = foreignTree.data.plane[1];
  var x4 = foreignTree.data.plane[2];
  var y4 = foreignTree.data.plane[3];

  var isect = lineline(x1,y1,x2,y2,x3,y3,x4,y4);

console.log(x1,y1,x2,y2,x3,y3,x4,y4, 'isect:', isect);

  if (isect === true) {
    // parallel line case
    var side = findSide(x1,y1,x2,y2,x3,y3); // could also do x4,y4 and it wouldn't matter

    switch (side) {
      case -1: // right
        this.rightChild.merge(foreignTree);
      break;
      case 0: // lines are colinear!
//console.log('colinear planes! do nothing!')
//console.log('points:', x1,y1,x2,y2,x3,y3,x4,y4);
      break;
      case 1: // left
        this.leftChild.merge(foreignTree);
      break;
      default:
        console.log('error in binarytreenode or findSide');
      break;
    }
  }
  else if (Array.isArray(isect)) {
    // we have an intersection, isect is an array


    this.leftChild.merge(foreignTree.leftChild);
    this.leftChild.merge(foreignTree.rightChild);
    this.rightChild.merge(foreignTree.leftChild);
    this.rightChild.merge(foreignTree.rightChild);
  }
  else {
    this.leftChild.merge(foreignTree);
    this.rightChild.merge(foreignTree);
  }



  // take plane from top node in foreignTree, and compare it against this node's plane
  // have an intersection?
    // => recurse into childen, sending foreignTree's plane along
  // no intersection?
    // => recurse into left or right child, depending on which side the plane lies
  // exact overlap?
    // => don't add it anywhere


  return this;
}

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
