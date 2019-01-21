/**
 * Data structure that holds a single website information
 */
class WebsiteState {
  /**
   * https://websitebuilders.com/how-to/web-at-a-glance/url-examples/
   * @param {string} protocol Ex. http, https
   * @param {string} topLevelDomain Ex. .com, .edu
   * @param {string} domainName
   */
  constructor(protocol, topLevelDomain, domainName) {
    this.protocol = protocol;
    this.topLevelDomain = topLevelDomain;
    this.domainName = domainName;
    this.pathTree = new PathTree();
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
   * A path formated where each '/' should be before each file/folder (can't end with '/'). Ex. /a/b/c, /a/b
   * @param {string} path should be a path starting with '/'
   */
  addPath(path) {
    const paths = path.split('/').filter(elem => elem.trim() !== '');
    let currentPathNode = this.root;
    paths.forEach(function(currentPath) {
      const childPathNode = currentPathNode.children.find(
        childPath => childPath.name === currentPath
      );
      if (!childPathNode) {
        const newPathNode = new PathNode(currentPath);
        currentPathNode.children.push(newPathNode);
        currentPathNode = newPathNode;
      } else {
        currentPathNode = childPathNode;
      }
    });
  }
}

class PathNode {
  constructor(name) {
    this.name = name;
    this.visited = false;
    /** if have permissions to visit the path. null if we haven't checked */
    this.allowed = null;
    this.children = [];
  }
}
