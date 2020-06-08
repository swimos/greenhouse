import sys
import time

from websocket import create_connection
from sense_hat import SenseHat

urlFromArgs = '127.0.0.1'
showDebug = False

if(len(sys.argv) > 1):
  urlFromArgs = sys.argv[1]

host = 'ws://' + urlFromArgs + ':9001'

print(host)
print(urlFromArgs)

swimSocket = create_connection(host)
sense = SenseHat()

def startBridge():
    while True:
        humidity = sense.get_humidity()
        if showDebug:
          print("[envSensorBridge] Humidity: %s rH" % humidity)

        message = "@command(node:\"/sensor/humidity\",lane:\"addLatest\"){\"" + str(sense.get_humidity()) + "\"}"
        swimSocket.send(message)    

        temp = sense.get_temperature()
        if showDebug:
          print("[envSensorBridge] Temperature: %s C" % temp)    

        message = "@command(node:\"/sensor/temperature\",lane:\"addLatest\"){\"" + str(sense.get_temperature()) + "\"}"
        swimSocket.send(message)    

        pressure = sense.get_pressure()
        if showDebug:
          print("[envSensorBridge] Pressure: %s Millibars" % pressure)

        message = "@command(node:\"/sensor/pressure\",lane:\"addLatest\"){\"" + str(sense.get_pressure()) + "\"}"
        swimSocket.send(message)    

        time.sleep(1)

        # temp = sense.get_temperature_from_humidity()    
        # print("Temperature(h): %s C" % temp)

        # temp = sense.get_temperature_from_pressure()
        # print("Temperature(p): %s C" % temp)    

if __name__ == '__main__':
  if showDebug:
    print("[envSensorBridge] starting main")
  try:
      startBridge()
  except IOError as err:
    print("[envSensorBridge] IO error: {0}".format(err))
  except:
    print("[envSensorBridge] Unknown Error:", sys.exc_info()[0])
    raise
    