const __request = require("request");
const __cheerio = require("cheerio");

class RequestHTML {
  constructor() {
    this.headers = {
      "User-Agent":
        "Spider-Explorer (https://github.com/AlexParra03/spiderbot)",
      Accept: "text/html"
    };
  }

  /**
   * Creates a promise for the HTML get method
   * @param {Object} options used as a parameter in the 'request' library
   */
  __fetchPage(options) {
    return new Promise(function(resolve, reject) {
      __request(options, function(err, response) {
        if (err) {
          reject(new Error(err));
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Promise that returns the HTML content of a page.
   * Ex: instance.get("https://example.com").then( function (html) ... )
   * @param {String} url of the page to fetch
   * @return {Promise: IncomingMessage if fulfilled} Incoming message object (https://nodejs.org/api/http.html#http_class_http_incomingmessage)
   */
  get(url) {
    const options = { url: url, headers: this.headers };
    return this.__fetchPage(options).then(
      function(response) {
        return response;
      },
      function(err) {
        return new Error(err);
      }
    );
  }
}

module.exports = {
  RequestHTML: RequestHTML
};