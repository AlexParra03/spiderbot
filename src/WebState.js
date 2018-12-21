/**
 * Used to store the information and graph of the World W.W.
 */
class WebState {
    constructor() {
        /** Map where key: url(string) and value: a Web-Object */
        this.webpages = new Map();
    }

    /**
     * TODO Format url before adding
     * @param {string} url  of the page to be added
     */
    addWebpage(url) {
        if(!this.webpages.has(url)) {
            this.__createWebpage(url);
        }
    }

    /**
     * Links 2 pages that had already been added
     * @param {string: url of the origin page, outgoing edge} urlOrigin 
     * @param {string: url of the destination page, incoming edge} urlDestination 
     */
    linkWebpages(urlOrigin, urlDestination) {
        if(!this.webpages.has(urlOrigin) || !this.webpages.has(urlDestination)) {
            throw new Error('Webpages to be linked were not added');
        }
        const webNodeOrigin = this.webpages.get(urlOrigin);
        const webNodeDestin = this.webpages.get(urlDestination);
        webNodeOrigin.addNeighbor(webNodeDestin);
    }

    __createWebpage(url) {
        this.webpages.set(url, new WebNode(url));
    }
}

/**
 * Web-page node that stores its data (ex. url, paths) and its neighbors
 */
class WebNode {
    constructor(url) {
        this.neighbors = [];
        this.url = url;
        this.path = new PathNode('');
    }

    addNeighbor(webNode) {
        this.neighbors.add(webNode);
    }

    getNeighbors() {
        return this.neighbors;
    }
}

/**
 * Tree structure used to store path routes
 */
class PathNode {
    constructor(name) {
        // TODO add parent logic
        // this.parent = this;
        this.name = name;
        this.children = [];
    }

    addChild(childName) {
        this.children.push(new PathNode(childName));
    }
}