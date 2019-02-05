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

  addPath(path) {
    this.pathTree.addPath(path);
  }
}

/**
 * Tree structure used to store path routes
 */
class PathTree {
  constructor() {
    this.root = new PathNode('');
  }

  /**
   * TODO handle ending slashed. Not all paths end in slash
   * A path formated where each '/' should be before each file/folder (can't end
   * with '/'). Ex. /a/b/c, /a/b
   * @param {string} path should be a path starting with '/'
   */
  addPath(path) {
    const paths = path.split('/').filter(elem => elem.trim() !== '');
    let currentPathNode = this.root;
    paths.forEach(function(currentPath) {
      const childPathNode = currentPathNode.children.find(
          childPath => childPath.name === currentPath);
      if (!childPathNode) {
        const newPathNode = new PathNode(currentPath);
        currentPathNode.children.push(newPathNode);
        currentPathNode = newPathNode;
      } else {
        currentPathNode = childPathNode;
      }
    });
  }

  /**
   * Generator that yields a path recursively when it has not been visited
   */
  * __pathsGenerator(path, node) {
    const currentPath = path + node.name + "/";
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
    this.children = [];
  }
}

module.exports = {
  WebsiteState: WebsiteState
};
