const express = require("express");
const path = require("path");
const {Spider} = require("./src/Spider");

const PORT = 3000;

const app = express();

app.use('/public', express.static(path.join(__dirname, '/client')));

const spider = new Spider();
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/index.html'));
});

app.get('/webState', async(req, res) => {
  spider.addToFrontier(req.query.url);
  try {
    await spider.crawl();
  } catch (e) {
  }

  // TODO, add method to stringify spider
  res.send(JSON.stringify(spider.WWWtoJSON()));
});

app.listen(PORT, () => {console.log(`Server listening in port: ${PORT}...`)});