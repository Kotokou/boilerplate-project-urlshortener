const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const { URL } = require("url");
const dns = require("dns");
let counter = 1;

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

const urls = {};

const validateUrl = (url) => {
  return /^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(
    url,
  );
};

app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;

  if (!validateUrl(url)) {
    return res.json({ error: "invalid url" });
  }

  dns.lookup(new URL(url).hostname, async (error, address, family) => {
    if (!address) {
      return res.json({ error: "invalid url" });
    } else {
      const shortUrl = counter++;
      urls[shortUrl] = url;
      return res.json({
        original_url: url,
        short_url: shortUrl,
      });
    }
  });
});

app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;

  if (!urls[shortUrl]) {
    return res.status(404).json({ error: "Short URL not found" });
  }

  res.redirect(urls[shortUrl]);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
