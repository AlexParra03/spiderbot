const DEFAULT_PERMISSION = true;
class Permissions {}

/**
 * 'Trie' Used to match expression rules from robots.txt
 *  https://developers.google.com/search/reference/robots_txt
 */
class ExpressionTree {
  constructor() {
    // dummy node
    this.root = new ExpressionNode("");
  }

  /**
   * Creates a new expression path from root to leaf
   * @param {string} expression (from robots.txt expression) characters to be added in the path of the Trie
   * @param {string} ruleType only "allow"/"disallow" type of rule added.
   */
  addExpression(expression, ruleType) {
    let currentNode = this.root;
    for (let i = 0; i < expression.length; i++) {
      const character = expression[i];
      if (!currentNode.children.has(character)) {
        currentNode.children.set(character, new ExpressionNode(character));
      }
      currentNode = currentNode.children.get(character);
      if (i == expression.length - 1) {
        if (ruleType === "allow") {
          currentNode.allowFlag = true;
        } else if (ruleType === "disallow") {
          currentNode.disallowFlag = true;
        } else {
          console.error(
            "Can't add expression to the tree, rule type not defined"
          );
        }
      }
    }
  }

  evaluateExpression(expression) {
    return this.__evaluateExpression(
      expression,
      this.root,
      DEFAULT_PERMISSION
    );
  }

  /**
   * Recursive helper in evaluating expression tree (trie) of allows and disallows
   * @param {string} expression path to be evaluated against the Trie
   * @param {ExpressionNode} node (current node is always dummy node), starting point
   * @param {boolean} currentVeredict if path is allowed, replaced when a longer expression is found (longest expression rules in robots.txt)
   */
  __evaluateExpression(expression, node, currentVeredict) {
    if (expression.length == 0) {
      if(DEFAULT_PERMISSION) {
        return (node.disallowFlag) ? false : currentVeredict;
      } else {
        return (node.allowFlag) ? true : currentVeredict;
      }
    }

    let newVeredict = currentVeredict;
    // most recent (longest) expression matched a disallowed path, not longer allowed
    if(node.disallowFlag) {
      newVeredict = false;
    }
    // most recent (longest) expression matched an allowed path, overrides disallowed
    if(node.allowFlag) {
      newVeredict = true;
    }
    if (node.children.has("*")) {
      // if its allowed, from all prefix of current expression
      const veredicts = [];
      const wildcardStartNode = node.children.get("*");
      // recursive trying all prefixes, wildcard *
      for(let i=0; i<expression.length; i++) {
        const postFix = expression.substr(i);
        veredicts.push(this.__evaluateExpression(
          postFix,
          wildcardStartNode,
          newVeredict
        ));
      }
      
      for(let i=0; i<veredicts.length; i++) {
        if(veredicts[i] != DEFAULT_PERMISSION) {
          newVeredict = veredicts[i];
          break;
        }
      }

    }
    if (node.children.has("$")) {
      const endOfLineNode = node.children.get("$");
      if(endOfLineNode.allowFlag && expression.length == 1) {
        return true;
      }
      if(endOfLineNode.disallowFlag && expression.length == 1) {
        return false;
      }
    }
    if (node.children.has(expression[0])) {
      return this.__evaluateExpression(
        expression.substr(1),
        node.children.get(expression[0]),
        newVeredict
      );
    }
    
    return newVeredict;
  }
}

class ExpressionNode {
  /**
   * Node in the Trie.
   * @param {string} value character of the current node
   */
  constructor(value) {
    this.value = value;
    /** Map where key {string} child values, and value {ExpressionNode} node data-structure */
    this.children = new Map();
    /** Flag that indicates that path from root to here is an 'allow' rule */
    this.allowFlag = false;
    /** Flag that indicates that path from root to here is a 'disallow' rule */
    this.disallowFlag = false;
  }
}
