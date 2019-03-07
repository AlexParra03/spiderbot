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
  }

  /**
   * Pops a website from the Queue and crawls it
   */
  async crawlOnce() {
    const permissionHelper = new Permissions();
    const website = this.frontier.pop();
    if (!this.WWWState.hasWebsite(website.networkLocation)) {
      let robotsTxt = "";
      let incomingMessage = null;
      try {
        incomingMessage = await this.requestHTML.get(
            website.protocol + "://" + website.networkLocation + "/robots.txt");
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
          const req = await this.requestHTML.get(
              website.protocol + '://' + website.networkLocation + path);
          html = req.body
        } catch (e) {
          console.error(e);
        }
      }
      const urls = this.getLinksfromHTML(html);

      for (const url of urls) {
        const parsedURL = URL.parse(url);


        let absolutePath = '';
        if (parsedURL.path === "null"  || typeof parsedURL.path !== "string" || parsedURL.protocol === "null" ||
            parsedURL.host === "null") {
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


        for (const newPath of website.getUnvisitedPaths()) {
          pathStack.push(newPath);
        }
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
}

module.exports = {
  Spider: Spider
};
