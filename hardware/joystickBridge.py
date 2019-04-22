import sys
import time

from websocket import create_connection
from sense_hat import SenseHat

urlFromArgs = '127.0.0.1'
showDebug = False

if(len(sys.argv) > 1):
  urlFromArgs = sys.argv[1]

host = 'ws://' + urlFromArgs + ':5620'

print(host)
print(urlFromArgs)

swimSocket = create_connection(host)
sense = SenseHat()

def waitForEvents():
  event = sense.stick.wait_for_event()
  if showDebug:
    print("The joystick was {} {}".format(event.action, event.direction))

  if event.action == "released":
    message = "@command(node:\"/device\",lane:\"setJoystickState\"){\"none\"}"
    swimSocket.send(message)    
    message = "@command(node:\"/device\",lane:\"setJoystickDirection\"){\"none\"}"
    swimSocket.send(message)    
  else:
    message = "@command(node:\"/device\",lane:\"setJoystickState\"){\"" + event.action + "\"}"
    swimSocket.send(message)    
    message = "@command(node:\"/device\",lane:\"setJoystickDirection\"){\"" + event.direction + "\"}"
    swimSocket.send(message)    

  waitForEvents()

waitForEvents()
