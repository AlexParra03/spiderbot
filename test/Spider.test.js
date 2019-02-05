const expect = require("chai").expect;
const {Spider} = require("../src/Spider");
const {Permissions} = require("../src/Permissions");
const {WebsiteState} = require("../src/WebsiteState");
const Nock = require("nock");

describe("Spider", function() {
  describe("Robots.txt handler", function() {
    it("should add allow rule type", function() {
      const robotstxt = `
              user-agent: *
              allow   :    /a
              `;
      const permissionsInstance = new Permissions();
      const spider = new Spider();
      spider.handleRobotstxt(robotstxt, permissionsInstance);
      expect(permissionsInstance.isAllowed("/a")).to.be.true;
    });

    it("should add disallow rule type", function() {
      const robotstxt = `
              user-agent: *
              disallow   :    /a
              `;
      const permissionsInstance = new Permissions();
      const spider = new Spider();
      spider.handleRobotstxt(robotstxt, permissionsInstance);
      expect(permissionsInstance.isAllowed("/a")).to.be.false;
    });

    it("should add several disallow rule types", function() {
      const robotstxt = `
              user-agent: *
              disallow   :    /a
              disallow   :    /b
              disallow   :    /c
              `;
      const permissionsInstance = new Permissions();
      const spider = new Spider();
      spider.handleRobotstxt(robotstxt, permissionsInstance);
      expect(permissionsInstance.isAllowed("/a")).to.be.false;
      expect(permissionsInstance.isAllowed("/b")).to.be.false;
      expect(permissionsInstance.isAllowed("/c")).to.be.false;
    });

    it("should read proper user agent", function() {
      const robotstxt = `
              user-agent: Not-Me
              disallow: /b
      
              user-agent: *
              disallow   :    /a
              `;
      const permissionsInstance = new Permissions();
      const spider = new Spider();
      spider.handleRobotstxt(robotstxt, permissionsInstance);
      expect(permissionsInstance.isAllowed("/a")).to.be.false;
      expect(permissionsInstance.isAllowed("/b")).to.be.true;
    });
  });

  describe("Scrape HTML links", function() {
    it("should scrape default <a> link", function() {
      const spider = new Spider();
      const html = `<html>
        <head></head>
        <body>
          <a href="/some/path" ></a>
        </body>
      </html>`;

      expect(spider.getLinksfromHTML(html)).to.eql(["/some/path"]);
    });

    it("should not scrape default <a> link with nofollow", function() {
      const spider = new Spider();
      const html = `<html>
        <head></head>
        <body>
          <a href="/some/path" ref="nofollow" ></a>
        </body>
      </html>`;

      expect(spider.getLinksfromHTML(html)).to.eql([]);
    });

    it("should scrape several default <a> link", function() {
      const spider = new Spider();
      const html = `<html>
        <head></head>
        <body>
          <a href="/some/path" ></a>
          <a href="/some/other" ></a>
          <a href="/some/another" ></a>
        </body>
      </html>`;

      expect(spider.getLinksfromHTML(html))
          .to.eql(["/some/path", "/some/other", "/some/another"]);
    });

    it("should not scrape <meta> with nofollow attribute", function() {
      const spider = new Spider();
      const html = `<html>
        <head>
          <meta content="nofollow">
        </head>
        <body>
          <a href="/some/path" ></a>
          <a href="/some/other" ></a>
          <a href="/some/another" ></a>
        </body>
      </html>`;

      expect(spider.getLinksfromHTML(html)).to.eql([]);
    });
  });

  describe("Crawling Pages", function() {
    it("should crawl absolute paths", async function() {
      const spider = new Spider();
      const website = new WebsiteState("https", "www.example.com");
      const permission = new Permissions();
      Nock("https://www.example.com").get("/").reply(200, `<html>
        <head></head>
        <body>
          <a href="/absolute/">Absolute Path</a>
        </body>
      
      </html>`);

      Nock("https://www.example.com").get("/absolute/").reply(200, `<html>
      <head></head>
      <body>
      </body>
    
    </html>`);

      await spider.crawlInternalWebsite(website, permission);
      expect(website.pathTree.root.name).to.eql("");
      expect(website.pathTree.root.visited).to.be.true;
      expect(website.pathTree.root.children[0].name).to.eql("absolute");
      expect(website.pathTree.root.children[0].visited).to.be.true;

    });

    it("should crawl relative paths", async function() {
      const spider = new Spider();
      const website = new WebsiteState("https", "www.example.com");
      const permission = new Permissions();
      Nock("https://www.example.com").get("/").reply(200, `<html>
        <head></head>
        <body>
          <a href="./relative/">Relative Path</a>
        </body>
      
      </html>`);

      Nock("https://www.example.com").get("/relative/").reply(200, `<html>
      <head></head>
      <body>
      </body>
    
    </html>`);

      await spider.crawlInternalWebsite(website, permission);
      expect(website.pathTree.root.name).to.eql("");
      expect(website.pathTree.root.visited).to.be.true;
      expect(website.pathTree.root.children[0].name).to.eql("relative");
      expect(website.pathTree.root.children[0].visited).to.be.true;

    });

    it("should crawl a single website from frontier", async function() {
      const spider = new Spider();
      const website = new WebsiteState("https", "www.example.com");
      const permission = new Permissions();
      spider.frontier = [website];
      Nock("https://www.example.com").get("/").reply(200, `<html>
        <head></head>
        <body>
          <a href="/absolute/">Absolute Path</a>
        </body>
      
      </html>`);

      Nock("https://www.example.com").get("/absolute/").reply(200, `<html>
      <head></head>
      <body>
      </body>
    
    </html>`);

      await spider.crawlInternalWebsite(website, permission);
      expect(website.pathTree.root.name).to.eql("");
      expect(website.pathTree.root.visited).to.be.true;
      expect(website.pathTree.root.children[0].name).to.eql("absolute");
      expect(website.pathTree.root.children[0].visited).to.be.true;

    });

    it("should crawl a single website from frontier and add external paths",
       async function() {
         const spider = new Spider();
         const website = new WebsiteState("https", "www.example.com");
         spider.frontier = [website];
         Nock("https://www.example.com").get("/").reply(200, `<html>
        <head></head>
        <body>
          <a href="https://www.exampletwo.com/path">Another webpage</a>
        </body>
      
      </html>`);

         Nock("https://www.example.com").get("/robots.txt").reply(200, "");


         await spider.crawlOnce();
         expect(spider.frontier.length).to.equal(1);
         const destinationWebsite = spider.WWWState.get('www.exampletwo.com');
         expect(destinationWebsite.pathTree.root.children[0].name)
             .to.eql("path");
       });
  });
});
