const __request = require("request");
const __cheerio = require("cheerio");

const TIMEOUT_DURATION_MS = 5000;

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
   * @param {number=} retries Number of fetch attempts
   * @return {Promise: IncomingMessage if fulfilled} Incoming message object (https://nodejs.org/api/http.html#http_class_http_incomingmessage)
   */
  get(url, retries = 3) {
    // No more retries, give up
    if (!retries) return Promise.resolve();

    // Keep track if the fetch was successful (to stop continued retries)
    let isFetchCompleted = false;

    // Attempt to fetch the url
    const options = { url, headers: this.headers };
    const fetchPromise = this.__fetchPage(options).then(
      function(response) {
        isFetchCompleted = true;
        return response;
      },
      function(err) {
        isFetchCompleted = true;
        return new Error(err);
      }
    );

    // Timeout promise, in case the fetch takes too long.
    const timeoutPromise =
        new Promise((resolve) => setTimeout(resolve, TIMEOUT_DURATION_MS)).then(
        () => {
          if (!isFetchCompleted) return this.get(url, --retries);
        });

    // Race the success or timeout promise, whichever comes first.
    return Promise.race([fetchPromise, timeoutPromise]);
  }
}

module.exports = {
  RequestHTML: RequestHTML
};
