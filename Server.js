const request = require('request');

const options = {
    url: 'http://www.google.com',
    headers: {
      'User-Agent': 'request'
    }
};

request(options, function (error, response, body) {
  console.log('error:', error); // Print the error if one occurred
  console.log('headers:', response.headers); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
});