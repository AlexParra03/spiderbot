const {WebsiteState} = require("./WebsiteState");

/**
 * Used to store the information and graph of the World W.W.
 */
class WorldWideWebState {
  constructor() {
    /** Map where key: {string} domain name --> value: a Web-Object
     * Useful to get Web-Object from the domain name
    */
    this.websites = new Map();

    /** Used to hold the outgoing websites that this website points to
     * where key {string} domain name --> value {Set<string>} domain names of
     * the neighbors/outgoing edges.
     */
    this.neighbors = new Map();
  }

  /**
   * Adds a website structure to the W.W.W.
   * @param {string} websiteProtocol  network protocol Ex. http/https
   * @param {string} websiteDomainName
   * @return {boolean} if the website was succesfully
   */
  addWebpage(websiteProtocol, websiteDomainName) {
    if (this.websites.has(websiteDomainName)) {
      console.error("Webpage to be added already exists");
    } else {
      this.websites.set(websiteDomainName,
                        new WebsiteState(websiteProtocol, websiteDomainName));
      return true;
    }
    return false;
  }

  /**
   * Adds a directed link from 2 webpages
   * @param {string} originDomainName domain name of the website origin
   * @param {string} destinationDomainName domain name of the website
   * destination
   * @return {boolean} if the website was linked succesfully
   */
  linkWebpage(originDomainName, destinationDomainName) {
    if (!this.websites.has(originDomainName) ||
        !this.websites.has(destinationDomainName)) {
      console.error(
          'Websites to be linked do no exist in the WWW State. Add them first');
      return false;
    }

    this.neighbors.set(originDomainName, destinationDomainName);
    return true;
  }

  /**
   * @param {string} hostname name of the host. Ex www.ex.com
   */
  hasWebsite(hostname) { return this.websites.has(hostname); }

/**
 *  Get the Website data-structure from hostname
 * @param {string} hostname
 * @return {WebsiteState} website state data-structure
 */
  get(hostname) { return this.websites.get(hostname); }
}



module.exports = {
  WorldWideWebState: WorldWideWebState
};