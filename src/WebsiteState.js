/**
 * Data structure that holds a single website information
 */
export class WebsiteState {
    /**
     * https://websitebuilders.com/how-to/web-at-a-glance/url-examples/
     * @param {string} protocol Ex. http, https 
     * @param {string} topLevelDomain Ex. .com, .edu
     * @param {string} domainName 
     */
    constructor(protocol, topLevelDomain, domainName ) {
        this.protocol = protocol;
        this.topLevelDomain = topLevelDomain;
        this.domainName = domainName;
        this.pathRoot = new PathNode('');
    }
}

/**
 * Tree structure used to store path routes
 */
class PathNode {
    constructor(name) {
        this.name = name;
        this.children = [];
    }

    addChild(childName) {
        this.children.push(new PathNode(childName));
    }
}