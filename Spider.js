class Spider {

  getHTML(url) {
    fetch(url, {headers:{"Content-Type":"text/html; charset=utf-8"}}).then(response => {
      const reader = response.body.getReader();
      let htmlWebpage = "";

      // read() returns a promise that resolves
      // when a value has been received
      reader.read().then(function processText({ done, value }) {
        // Result objects contain two properties:
        // done  - true if the stream has already given you all its data.
        // value - some data. Always undefined when done is true.
        if (done) {
          console.log("Stream complete");
          return;
        }

        // value for fetch streams is a Uint8Array filled with utf-8 characters
        const chunk = value;
        let webpageStream = "";
        chunk.forEach(utfChar => {
          webpageStream += String.fromCharCode(utfChar);
        });
        htmlWebpage += webpageStream;

        // Read some more, and call this function again
        return reader.read().then(processText);
      });
      return htmlWebpage;
    });
  }
}
