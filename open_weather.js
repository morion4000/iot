var request = require('request');
var Influx = require('influxdb-nodejs');
var client = new Influx(process.env.INFLUXDB_URL);

var url = 'http://api.openweathermap.org/data/2.5/weather?id=678817&appid=447c49278396f84cb98accb900ff01ed&units=metric';

var fieldSchema = {
  value: 'i',
};

var tagSchema = {
  sensor: '*',
  parameter: '*',
};

client.schema('sensors3', fieldSchema, tagSchema, {
  // default is false
  stripUnknown: true,
});

//require('request-debug')(request);

request.get(url, function(err, message, body) {
  var data = JSON.parse(body);
  var temperature = parseInt(data.main.temp);
  var humidity = parseInt(data.main.humidity);

  // Don't care about sub 0 temps, and it messes up the db
  if (temperature < 0) temperature = 0;

  client.write('sensors3')
      .tag({
        sensor: 'openweather',
        parameter: 'temperature'
      })
      .field({
        value: temperature,
      })
      .then(console.log)
      .catch(console.error);

    client.write('sensors3')
      .tag({
        sensor: 'openweather',
        parameter: 'humidity'
      })
      .field({
        value: humidity,
      })
      .then(console.log)
      .catch(console.error);
});
