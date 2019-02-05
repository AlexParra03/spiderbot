const expect = require("chai").expect;
const {WebsiteState} = require("../src/WebsiteState");

describe("Website State", function() {
  describe("Generator", function() {
    it("should iterate only over new paths added", function() {
      const websiteState = new WebsiteState();
      websiteState.pathTree.addPath("/a/b/c");
      websiteState.pathTree.addPath("/a/b1/c");

      for (const path of websiteState.getUnvisitedPaths()) {
        // marking nodes as visited by iterating
      }

      websiteState.pathTree.addPath("/a/b1/c1");
      websiteState.pathTree.addPath("/a/b1/c2");
      const paths = [];
      for (const path of websiteState.getUnvisitedPaths()) {
        paths.push(path);
      }
      expect(paths).to.eql(["/a/b1/c1/", "/a/b1/c2/"]);
    });

    it("should iterate over path added", function() {
      const websiteState = new WebsiteState();
      websiteState.pathTree.addPath("/a");

      const paths = [];
      for (const path of websiteState.getUnvisitedPaths()) {
        paths.push(path);
      }
      expect(paths).to.eql(["/", "/a/"]);
    });

    it("should iterate over parent paths added", function() {
      const websiteState = new WebsiteState();
      websiteState.pathTree.addPath("/a/b");

      const paths = [];
      for (const path of websiteState.getUnvisitedPaths()) {
        paths.push(path);
      }
      expect(paths).to.eql(["/", "/a/", "/a/b/"]);
    });
  });

  describe("Tree", function() {
    it("should create root", function() {
      const websiteState = new WebsiteState();
      expect(websiteState.pathTree.root).not.to.be.undefined;
      expect(websiteState.pathTree.root.name).to.equal("");
    });

    it("should add a path", function() {
      const websiteState = new WebsiteState();
      websiteState.addPath("/a");
      expect(websiteState.pathTree.root).not.to.be.null;
      expect(websiteState.pathTree.root.name).to.equal("");
      expect(websiteState.pathTree.root.children[0].name).to.equal("a");
    });

    it("should add several paths", function() {
      const websiteState = new WebsiteState();
      websiteState.addPath("/a");
      websiteState.addPath("/b");
      expect(websiteState.pathTree.root).not.to.be.null;
      expect(websiteState.pathTree.root.name).to.equal("");
      expect(websiteState.pathTree.root.children[0].name).to.equal("a");
      expect(websiteState.pathTree.root.children[1].name).to.equal("b");
    });
  });

});