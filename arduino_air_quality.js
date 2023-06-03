const http = require("http");
const url = require("url");
const MongoClient = require("mongodb").MongoClient;

const port = process.env.PORT || 8080;
let db;

MongoClient.connect(process.env.MONGDB_URL, { useUnifiedTopology: true })
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

    console.log(q);

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

    db.collection("measurements").insertOne(data, (err, result) => {
      if (err) {
        console.log(err);
      }
    });

    res.write("Logged");
    res.end();
  })
  .listen(port);

console.log("ready");
