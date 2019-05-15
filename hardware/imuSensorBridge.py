import sys
import time

from websocket import create_connection
from sense_hat import SenseHat

urlFromArgs = '127.0.0.1'

if(len(sys.argv) > 1):
  urlFromArgs = sys.argv[1]

host = 'ws://' + urlFromArgs + ':5620'

swimSocket = create_connection(host)
sense = SenseHat()
showDebug = True

def startBridge():
    while True:
        # orientation in radians
        orientationRad = sense.get_orientation_radians()

        message = "@command(node:\"/sensor/orientationRadPitch\",lane:\"addLatest\"){\"" + str(orientationRad["pitch"]) + "\"}"
        swimSocket.send(message)    
  
        message = "@command(node:\"/sensor/orientationRadYaw\",lane:\"addLatest\"){\"" + str(orientationRad["yaw"]) + "\"}"
        swimSocket.send(message)    

        message = "@command(node:\"/sensor/orientationRadRoll\",lane:\"addLatest\"){\"" + str(orientationRad["roll"]) + "\"}"
        swimSocket.send(message)    

        # orientation in degrees
        orientationDeg = sense.get_orientation()

        message = "@command(node:\"/sensor/orientationDegPitch\",lane:\"addLatest\"){\"" + str(orientationDeg["pitch"]) + "\"}"
        swimSocket.send(message)    
  
        message = "@command(node:\"/sensor/orientationDegYaw\",lane:\"addLatest\"){\"" + str(orientationDeg["yaw"]) + "\"}"
        swimSocket.send(message)    

        message = "@command(node:\"/sensor/orientationDegRoll\",lane:\"addLatest\"){\"" + str(orientationDeg["roll"]) + "\"}"
        swimSocket.send(message)    

        # compass raw
        compassRaw = sense.get_compass_raw()

        message = "@command(node:\"/sensor/compassX\",lane:\"addLatest\"){\"" + str(compassRaw["x"]) + "\"}"
        swimSocket.send(message)    
  
        message = "@command(node:\"/sensor/compassY\",lane:\"addLatest\"){\"" + str(compassRaw["y"]) + "\"}"
        swimSocket.send(message)    

        message = "@command(node:\"/sensor/compassZ\",lane:\"addLatest\"){\"" + str(compassRaw["z"]) + "\"}"
        swimSocket.send(message)    

        # raw gyro
        gyro = sense.get_gyroscope_raw()

        message = "@command(node:\"/sensor/gyroX\",lane:\"addLatest\"){\"" + str(gyro["x"]) + "\"}"
        swimSocket.send(message)    
  
        message = "@command(node:\"/sensor/gyroY\",lane:\"addLatest\"){\"" + str(gyro["y"]) + "\"}"
        swimSocket.send(message)    

        message = "@command(node:\"/sensor/gyroZ\",lane:\"addLatest\"){\"" + str(gyro["z"]) + "\"}"
        swimSocket.send(message)    

        # raw accel
        accel = sense.get_accelerometer_raw()

        message = "@command(node:\"/sensor/accelerationX\",lane:\"addLatest\"){\"" + str(accel["x"]) + "\"}"
        swimSocket.send(message)    
  
        message = "@command(node:\"/sensor/accelerationY\",lane:\"addLatest\"){\"" + str(accel["y"]) + "\"}"
        swimSocket.send(message)    

        message = "@command(node:\"/sensor/accelerationZ\",lane:\"addLatest\"){\"" + str(accel["z"]) + "\"}"
        swimSocket.send(message)    


        # time.sleep(1/5000)

if __name__ == '__main__':
  print("starting main")
  try:
      startBridge()
  except IOError as err:
    print("IO error: {0}".format(err))
  except:
    print("Unknown Error:", sys.exc_info()[0])
    raise
    