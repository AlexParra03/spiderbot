const {Permissions} = require("./Permissions");
const {RequestHTML} = require("./RequestHTML");
const {WorldWideWebState} = require("./WorldWideWebState");
const {WebsiteState} = require("./WebsiteState");
const URL = require("url");
const Path = require("path");
const __cheerio = require("cheerio");

class Spider {
  constructor() {
    this.frontier = [];
    this.requestHTML = new RequestHTML();
    this.WWWState = new WorldWideWebState();
    this.TOTAL_WEBSITES = 10;
    this.websitesCrawled = 0;
  }

  /**
   * Adds a website to the beggining of the queue/frontier
   * @param {string} website full URL of the website
   */
  addToFrontier(website) {
    const url = URL.parse(website);
    if (url.protocol && url.host) {
      const websiteObject = new WebsiteState(url.protocol, url.host);
      if (url.path) {
        websiteObject.addPath(url.path);
      }
      this.frontier.unshift(websiteObject);
    }
  }

  /**
   * Pops a website from the Queue and crawls it
   */
  async crawl() {
    const permissionHelper = new Permissions();
    if (this.frontier.length === 0) {
      console.log("Finished");
      return;
    }
    const website = this.frontier.pop();
    let robotsTxt = "";
    let incomingMessage = null;
    try {
      console.log(
          "Requesting crawling rules from ",
          website.protocol + "//" + website.networkLocation + "/robots.txt");
      incomingMessage = await this.requestHTML.get(
          website.protocol + "//" + website.networkLocation + "/robots.txt");
      if (incomingMessage === undefined) {
        return;
      }
      if (incomingMessage.statusCode == 200) {
        robotsTxt = incomingMessage.body;
      }
    } catch (err) {
      console.log(err);
    }
    this.handleRobotstxt(robotsTxt, permissionHelper);
    const currentHost = incomingMessage.request.uri.host;
    const currentHostProtocol = incomingMessage.request.uri.protocol;

    if (currentHost !== website.networkLocation) {
      // We were redirected
      this.WWWState.addWebpage(currentHostProtocol, currentHost);
      this.WWWState.addWebpage(website.protocol, website.networkLocation);
      this.WWWState.linkWebpage(website.networkLocation, currentHost)
    } else {
      this.WWWState.addWebpage(currentHostProtocol, currentHost);
    }
    await this.crawlInternalWebsite(website, permissionHelper);
    console.log("Finished scrapping ", currentHost);
    this.websitesCrawled++;
    if (this.websitesCrawled < this.TOTAL_WEBSITES) {
      try {
        await this.crawl();
      } catch (e) {
      }
      console.log("Websites crawled:", this.websitesCrawled);
    }
  }

  /**
   * Crawls an website internally building paths and linking to new websites
   * @param {WebsiteState} website
   * @param {Permissions} permissionHelper
   */
  async crawlInternalWebsite(website, permissionHelper) {
    const pathStack = [];
    for (const path of website.getUnvisitedPaths()) {
      pathStack.push(path);
    }

    while (pathStack.length > 0) {
      const path = pathStack.pop();
      let html = "";

      if (permissionHelper.isAllowed(path)) {
        try {
          console.log("Scrapping ",
                      website.protocol + '//' + website.networkLocation + path);
          const req = await this.requestHTML.get(
              website.protocol + '//' + website.networkLocation + path);
          if (req !== undefined) {
            html = req.body
          }
        } catch (e) {
          console.error(e);
        }
      }
      const urls = this.getLinksfromHTML(html);

      for (const url of urls) {
        const parsedURL = URL.parse(url);


        let absolutePath = '';
        if (typeof parsedURL.path !== "string") {
          continue;
        }

        if (Path.isAbsolute(parsedURL.path)) {
          absolutePath = Path.normalize(parsedURL.path);
        } else {
          absolutePath = Path.join(path, parsedURL.path);
        }
        // backward slash replaced for Windows OS
        absolutePath = absolutePath.replace(/[\\]/g, '/');

        if (parsedURL.hostname) {
          // URL has a hostname
          if (parsedURL.host === website.networkLocation) {
            website.addPath(absolutePath);
          } else {
            // add other website with the path
            this.WWWState.addWebpage(parsedURL.protocol, parsedURL.host);
            const newOrigin = this.WWWState.get(parsedURL.host);
            newOrigin.addPath(absolutePath);
            this.frontier.unshift(newOrigin);
            this.WWWState.linkWebpage(website.networkLocation, parsedURL.host);
          }
        } else {
          website.addPath(absolutePath);
        }
      }

      for (const newPath of website.getUnvisitedPaths()) {
        pathStack.push(newPath);
      }
    }
  }

  /**
   * Adds rules to the reference of Permissions instance
   * @param {string} text robots.txt file to be parsed
   * @param {Permissions} permissionHelper unpopulated reference to add rules
   */
  handleRobotstxt(text, permissionHelper) {
    const lines = text.split("\n").map(line => line.toLocaleLowerCase());
    let readingRules = false;
    lines.forEach(line => {
      if (line.includes("user-agent")) {
        const agent = line.substring(line.search(":") + 1).trim();
        if (agent === "*") {
          readingRules = true;
          // Stop processing this iteration, 'continue'
          return;
        }
      }
      if (readingRules) {
        if (line.includes("disallow")) {
          const path = line.substring(line.search(":") + 1).trim();
          permissionHelper.addPath(path, "disallow");
        } else if (line.includes("allow")) {
          const path = line.substring(line.search(":") + 1).trim();
          permissionHelper.addPath(path, "allow");
        } else {
          readingRules = false;
        }
      }
    });
  }

  /**
   *
   * @param {string} html html content to be scrapped
   * @return {Array<string>} URLs of internal and external valid webpages
   */
  getLinksfromHTML(html) {
    const paths = [];
    const $ = __cheerio.load(html);
    const metaTags = $('meta');
    let pageForbidden = false;
    $(metaTags)
        .each(function(i, meta) {
          if ($(meta).attr('content') === "nofollow") {
            pageForbidden = true;
            return;
          }
        });
    if (pageForbidden) {
      return [];
    }

    const aTags = $('a');
    $(aTags)
        .each(function(i, link) {
          if ($(link).attr("ref") !== "nofollow") {
            paths.push($(link).attr("href"));
          }
        });
    return paths;
  }

  /**
   *  Prepares data from W.W.W. for sending to the client for vis.js rendering
   *  @return {nodes: Array<{id: integer, label: string}>,
   *           edges: Array<{from: integer: to: integer}> }
   */
  WWWtoJSON() {
    const nodesData = [];
    let idCounter = 0;
    for (const domainName of this.WWWState.websites.keys()) {
      const node = {id: idCounter, label: domainName};
      nodesData.push(node);
      idCounter++;
    }
    const edgesData = [];
    for (const domainName of this.WWWState.websites.keys()) {
      for (const target of this.WWWState.neighbors.get(domainName).keys()) {
        const domains = nodesData.map(node => node.label);
        const targetId =
            domains.findIndex(currentDomain => currentDomain === target);
        const sourceId =
            domains.findIndex(currentDomain => currentDomain === domainName);
        const edge = {from: sourceId, to: targetId};
        edgesData.push(edge);
      }
    }

    return {nodes: nodesData, edges: edgesData};
  }
}

module.exports = {
  Spider: Spider
};
