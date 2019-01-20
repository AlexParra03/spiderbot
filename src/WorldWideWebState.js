import { WebsiteState } from "./WebsiteState";

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
     * where key {string} domain name --> value {Set<string>} domain names of the neighbors/outgoing edges.
     */
    this.neighbors = new Map();
  }

  /**
   * Adds a website structure to the W.W.W.
   * @param {WebsiteState} website  website to be added.
   */
  addWebpage(website) {
    if (!website || !website.domainName) {
      console.error("Not a valid website object");
    }
    if (this.websites.has(website.domainName)) {
      console.error("Webpage to be added already exists");
    } else {
        this.websites.set(website.domainName, website);
    }
  }

  /**
   * Adds a directed link from 2 webpages
   * @param {string} originDomainName domain name of the website origin 
   * @param {string} destinationDomainName domain name of the website destination
   */
  linkWebpage(originDomainName, destinationDomainName) {
    if(!this.websites.has(originDomainName) || !this.websites.has(destinationDomainName)) {
        console.error('Websites to be linked do no exist in the WWW State. Add them first');
    }

    this.neighbors.set(originDomainName, destinationDomainName);
  }
}
