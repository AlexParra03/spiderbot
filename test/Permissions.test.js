const expect = require("chai").expect;
const {
  ExpressionNode,
  ExpressionTree,
  Permissions
} = require("../src/Permissions");

describe("Expression Node", function() {
  it("should initialize its value field", function() {
    const expressionNodeInstance = new ExpressionNode("testValue");
    expect(expressionNodeInstance.value).to.equal("testValue");
  });
});

describe("Expression Tree", function() {
  it("should create a dummy empty node", function() {
    const instance = new ExpressionTree(true);
    expect(instance.root).not.to.be.undefined;
  });

  it("should create the appropiate tree paths", function() {
    const instance = new ExpressionTree(true);
    instance.addExpression("ac", "allow");
    instance.addExpression("ab", "allow");

    const firstChild = instance.root.children.get("a");
    expect(firstChild).not.to.be.undefined;
    expect(firstChild.value).to.equal("a");

    const leafOne = firstChild.children.get("c");
    expect(leafOne).not.to.be.undefined;
    expect(leafOne.value).to.equal("c");

    const leafTwo = firstChild.children.get("b");
    expect(leafTwo).not.to.be.undefined;
    expect(leafTwo.value).to.equal("b");
  });

  it("should set the appropiate true flag", function() {
    const instance = new ExpressionTree(true);
    const RULE = "allow";
    instance.addExpression("ab", RULE);

    const firstChild = instance.root.children.get("a");
    const leafOne = firstChild.children.get("b");

    expect(leafOne).not.to.be.undefined;
    expect(leafOne.allowFlag).to.be.true;
  });

  it("should set the appropiate false flag", function() {
    const instance = new ExpressionTree(true);
    const RULE = "disallow";
    instance.addExpression("ab", RULE);

    const firstChild = instance.root.children.get("a");
    const leafOne = firstChild.children.get("b");

    expect(leafOne).not.to.be.undefined;
    expect(leafOne.allowFlag).to.be.false;
  });

  describe("Default Allow", function() {
    const DEFAULT_PERMISSION = true;
    let instance;

    beforeEach(function() {
      instance = new ExpressionTree(DEFAULT_PERMISSION);
    });

    it("should disallow a matching exact path", function() {
      instance.addExpression("/a", "disallow");
      expect(instance.evaluateExpression("/a")).to.be.false;
    });

    it("should disallow a matching longer path", function() {
      instance.addExpression("/a", "disallow");
      expect(instance.evaluateExpression("/aaaa")).to.be.false;
    });

    it("should disallow a matching exact path with multiple expressions", function() {
      instance.addExpression("/aa", "disallow");
      instance.addExpression("/ab", "disallow");
      expect(instance.evaluateExpression("/ab")).to.be.false;
    });

    it("should disallow a matching longer path with multiple expressions", function() {
      instance.addExpression("/aa", "disallow");
      instance.addExpression("/ab", "disallow");
      expect(instance.evaluateExpression("/abc")).to.be.false;
    });

    it("should allow (by default) a path not in the tree", function() {
      instance.addExpression("/aa", "disallow");
      instance.addExpression("/ab", "disallow");
      expect(instance.evaluateExpression("/f")).to.be.true;
    });

    it("should allow longer expresson with allow and disallow expressions", function() {
      instance.addExpression("/ab", "allow");
      instance.addExpression("/ac", "disallow");
      expect(instance.evaluateExpression("/abb")).to.be.true;
    });
  });

  describe("Default Disallow", function() {
    const DEFAULT_PERMISSION = false;
    let instance;

    beforeEach(function() {
      instance = new ExpressionTree(DEFAULT_PERMISSION);
    });

    it("should allow a matching exact path", function() {
      instance.addExpression("/a", "allow");
      expect(instance.evaluateExpression("/a")).to.be.true;
    });

    it("should allow a matching longer path", function() {
      instance.addExpression("/a", "allow");
      expect(instance.evaluateExpression("/aaaa")).to.be.true;
    });

    it("should allow a matching exact path with multiple expressions", function() {
      instance.addExpression("/aa", "allow");
      instance.addExpression("/ab", "allow");
      expect(instance.evaluateExpression("/ab")).to.be.true;
    });

    it("should allow a matching longer path with multiple expressions", function() {
      instance.addExpression("/aa", "allow");
      instance.addExpression("/ab", "allow");
      expect(instance.evaluateExpression("/abc")).to.be.true;
    });

    it("should disallow (by default) a path not in the tree", function() {
      instance.addExpression("/aa", "disallow");
      instance.addExpression("/ab", "disallow");
      expect(instance.evaluateExpression("/f")).to.be.false;
    });

    it("should disallow longer expresson with allow and disallow expressions", function() {
      instance.addExpression("/ab", "allow");
      instance.addExpression("/ac", "disallow");
      expect(instance.evaluateExpression("/aca")).to.be.false;
    });
  });

  describe("Wilcards", function() {
    const DEFAULT_PERMISSION = true;
    let instance;

    beforeEach(function() {
      instance = new ExpressionTree(DEFAULT_PERMISSION);
    });

    it("should disallow all(*) paths with 0 characters in gap", function() {
      instance.addExpression("/a*b", "disallow");
      expect(instance.evaluateExpression("")).to.be.true;
      expect(instance.evaluateExpression("/ab")).to.be.false;
    });

    it("should disallow all(*) paths with 1 or more characters in gap", function() {
      instance.addExpression("/a*b", "disallow");
      expect(instance.evaluateExpression("")).to.be.true;
      expect(instance.evaluateExpression("/aXb")).to.be.false;
      expect(instance.evaluateExpression("/aXXXb")).to.be.false;
      expect(instance.evaluateExpression("/aXXXXXXXb")).to.be.false;
    });

    it("should not disallow end of line ($) paths that does not end with expression", function() {
      instance.addExpression("/ab$", "disallow");
      expect(instance.evaluateExpression("")).to.be.true;
      expect(instance.evaluateExpression("/abX")).to.be.true;
    });

    it("should disallow end of line ($) paths that end with expression", function() {
      instance.addExpression("/ab$", "disallow");
      expect(instance.evaluateExpression("")).to.be.true;
      expect(instance.evaluateExpression("/ab")).to.be.false;
      expect(instance.evaluateExpression("/abX")).to.be.true;
    });
  });
});
