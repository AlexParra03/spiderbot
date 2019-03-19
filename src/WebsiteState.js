/**
 * Data structure that holds a single website information
 */
class WebsiteState {
  /**
   * https://websitebuilders.com/how-to/web-at-a-glance/url-examples/
   * @param {string} protocol Ex. http, https
   * @param {string} networkLocation Domain, Ex. example.com, www.page.edu
   */
  constructor(protocol, networkLocation) {
    this.protocol = protocol;
    this.networkLocation = networkLocation;
    this.pathTree = new PathTree();
  }

  /**
    Returns an iterable to iterate over new paths from the tree path
   */
  getUnvisitedPaths() {
    return this.pathTree.__pathsGenerator("", this.pathTree.root);
  }

  addPath(path) { this.pathTree.addPath(path); }
}

/**
 * Tree structure used to store path routes
 */
class PathTree {
  constructor() {
    this.root = new PathNode('');
    this.MAX_NODES = 50;
    this.currentNodes = 0;
  }

  /**
   * TODO handle ending slashed. Not all paths end in slash
   * A path formated where each '/' should be before each file/folder (can't end
   * with '/'). Ex. /a/b/c, /a/b
   * @param {string} path should be a path starting with '/'
   */
  addPath(path) {
    if (this.currentNodes >= this.MAX_NODES) {
      return;
    }
    const endsWithSlash = path[path.length - 1] === '/';
    const paths = path.split('/').filter(elem => elem.trim() !== '');
    let currentPathNode = this.root;
    paths.forEach((currentPath) => {
      const childPathNode = currentPathNode.children.find(
          childPath => childPath.name === currentPath);
      if (childPathNode === undefined) {
        if (this.currentNodes < this.MAX_NODES) {
          const newPathNode = new PathNode(currentPath);
          this.currentNodes++;
          currentPathNode.children.push(newPathNode);
          currentPathNode = newPathNode;
          if (currentPath == paths[paths.length - 1]) {
            newPathNode.endsWithSlash = endsWithSlash;
          }
        }

      } else {
        currentPathNode = childPathNode;
      }
    });
  }

  /**
   * Generator that yields a path recursively when it has not been visited
   */
  * __pathsGenerator(path, node) {
    const endingSlash =
        (node.children.length > 0 || node.endsWithSlash) ? '/' : '';
    const currentPath = path + node.name + endingSlash;
    if (!node.visited) {
      yield currentPath;
      node.visited = true;
    }
    for (const child of node.children) {
      yield * this.__pathsGenerator(currentPath, child);
    }
  }
}

class PathNode {
  constructor(name) {
    this.name = name;
    this.visited = false;
    this.endsWithSlash = true;
    this.children = [];
  }
}

module.exports = {
  WebsiteState: WebsiteState
};
