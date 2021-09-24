#include <Wire.h>
#include <DHT.h>
#include <ESP8266WiFi.h>
#include <ESP8266mDNS.h>
#include <SparkFunCCS811.h>

#define DHTPIN 4
#define DHTTYPE DHT11
#define CCS811_ADDR 0x5B //Default I2C Address

//////////////////////
// WiFi Definitions //
//////////////////////
const char WiFiSSID[] = "x";
const char WiFiPSK[] = "x";

/////////////////////
// Pin Definitions //
/////////////////////
const int LED_PIN = 5; // Thing's onboard, green LED
const int ANALOG_PIN = A0; // The only analog pin on the Thing
const int DIGITAL_PIN = 12; // Digital pin to be read

const char IOT_URL[] = "x.x.eu";

DHT dht(DHTPIN, DHTTYPE);
CCS811 myCCS811(CCS811_ADDR);
WiFiServer server(80);
WiFiClient client;

void setup()
{
  Serial.begin(9600);

  pinMode(DIGITAL_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);

  digitalWrite(LED_PIN, HIGH);

  connectWiFi();

  server.begin();
  dht.begin();
  Wire.begin(2, 14); //Inialize I2C Hardware

  // Allow sensors to init
  delay(2000);

  if (myCCS811.begin() == false)
  {
    Serial.print("CCS811 error. Please check wiring. Freezing...");
    while (1)
      ;
  }
}

void loop()
{
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  int CO2 = 0;
  int TVOC = 0;

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println(F("Failed to read from DHT sensor!"));
  }

  Serial.print("TEMP:");
  Serial.println(temperature);
  Serial.print("HUMIDITY:");
  Serial.println(humidity);

  if (myCCS811.dataAvailable()) {
    myCCS811.readAlgorithmResults();

    CO2 = myCCS811.getCO2();
    TVOC = myCCS811.getTVOC();

    Serial.print("CO2:");
    Serial.println(CO2);
    Serial.print("TVOC:");
    Serial.println(TVOC);
  }

  httpRequest(temperature, humidity, CO2, TVOC);

  delay(60000);
}

void connectWiFi()
{
  byte ledStatus = LOW;

  Serial.println();
  Serial.println("Connecting to: " + String(WiFiSSID));

  // Set WiFi mode to station (as opposed to AP or AP_STA)
  WiFi.mode(WIFI_STA);

  // WiFI.begin([ssid], [passkey]) initiates a WiFI connection
  // to the stated [ssid], using the [passkey] as a WPA, WPA2,
  // or WEP passphrase.
  WiFi.begin(WiFiSSID, WiFiPSK);

  // Use the WiFi.status() function to check if the ESP8266
  // is connected to a WiFi network.
  while (WiFi.status() != WL_CONNECTED)
  {
    // Blink the LED
    digitalWrite(LED_PIN, ledStatus); // Write LED high/low
    ledStatus = (ledStatus == HIGH) ? LOW : HIGH;

    // Delays allow the ESP8266 to perform critical tasks
    // defined outside of the sketch. These tasks include
    // setting up, and maintaining, a WiFi connection.
    delay(100);
    // Potentially infinite loops are generally dangerous.
    // Add delays -- allowing the processor to perform other
    // tasks -- wherever possible.
  }

  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void httpRequest(int temperature, int humidity, int CO2, int TVOC) {
  client.stop();

  digitalWrite(LED_PIN, HIGH);

  if (client.connect(IOT_URL, 80)) {
    String GET = "GET /?temperature=" + String(temperature) + "&humidity=" + String(humidity) + "&CO2=" + String(CO2) + "&TVOC=" + String(TVOC) + " HTTP/1.1";

    Serial.println(GET);

    client.println(GET);
    client.println("Host: " + String(IOT_URL));
    client.println("User-Agent: arduino-ethernet");
    client.println("Connection: close");
    client.println();
  } else {
    // if you couldn't make a connection:
    Serial.println("connection failed");
  }

  digitalWrite(LED_PIN, LOW);
}
