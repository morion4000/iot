const fs = require("fs");
const http = require("http");
const url = require("url");
const MongoClient = require("mongodb").MongoClient;

const port = process.env.PORT || 8080;
let db;

MongoClient.connect(process.env.MONGODB_URL, { useUnifiedTopology: true })
  .then((client) => {
    console.log("connected");

    db = client.db("air_quality");
  })
  .catch((err) => {
    console.log("Error occurred while connecting to MongoDB Atlas...\n", err);
  });

http
  .createServer(function (req, res) {
    const q = url.parse(req.url, true).query;
    const data = {
      date: new Date(),
      measurement: "air_quality",
    };

    if (q.temperature) {
      data.temperature = parseInt(q.temperature);
    }

    if (q.humidity) {
      data.humidity = parseInt(q.humidity);
    }

    if (q.CO2) {
      data.CO2 = parseInt(q.CO2);
    }

    if (q.TVOC) {
      data.TVOC = parseInt(q.TVOC);
    }

    if (Object.keys(q).length === 0) {
      fs.readFile("./index.html", "utf8", (err, data) => {
        if (err) {
          console.log(err);
          res.writeHead(500);
          res.end("An error occurred while reading the file");
        } else {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(data);
        }
      });
    } else {
      console.log(data);

      db.collection("measurements").insertOne(data, (err, result) => {
        if (err) {
          console.log(err);
        }
      });

      res.write("Logged");
      res.end();
    }
  })
  .listen(port);

console.log("ready");
