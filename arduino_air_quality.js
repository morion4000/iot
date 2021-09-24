var http = require('http');
var url = require('url');
var Influx = require('influxdb-nodejs');

var client = new Influx(process.env.INFLUXDB_URL);
var port = process.env.PORT || 8080;
var fieldSchema = {
  value: 'i',
};
var tagSchema = {
  sensor: '*',
  parameter: '*',
};

client.schema('air_quality', fieldSchema, tagSchema, {
  // default is false
  stripUnknown: true,
});

//client.createDatabase().then(console.log).catch(console.error);return;

/*
client.query('hashes')
  .then(function(d) {
    console.log(d.results[0].series[0])
  })
  .catch(console.error);
*/

http.createServer(function (req, res) {
  var q = url.parse(req.url, true).query;

  console.log(q);

  if (q.temperature) {
    client.write('air_quality')
      .tag({
        sensor: 'DH11',
        parameter: 'temperature'
      })
      .field({
        value: parseInt(q.temperature),
      })
      .then(console.log)
      .catch(console.error);
  }

  if (q.humidity) {
    client.write('air_quality')
      .tag({
        sensor: 'DH11',
        parameter: 'humidity'
      })
      .field({
        value: parseInt(q.humidity),
      })
      .then(console.log)
      .catch(console.error);
  }
  
  if (q.CO2) {
    client.write('air_quality')
      .tag({
        sensor: 'CCS811',
        parameter: 'CO2'
      })
      .field({
        value: parseInt(q.CO2),
      })
      .then(console.log)
      .catch(console.error);
  }
  
  if (q.TVOC) {
    client.write('air_quality')
      .tag({
        sensor: 'CCS811',
        parameter: 'TVOC'
      })
      .field({
        value: parseInt(q.TVOC),
      })
      .then(console.log)
      .catch(console.error);
  }

  res.write('Hello World!');
  res.end();
}).listen(port);

console.log('ready');
