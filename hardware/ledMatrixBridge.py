import sys
import time
import json

from sense_hat import SenseHat

appRunning = True
showDebug = False

sense = SenseHat()

def start():
    if showDebug:
      print("[ledMatrixBridge] Start Python<->LED Matrix Bridge")
    sys.stdout.flush()
    
    sense.set_rotation(180)
    sense.show_message("Ready...", 0.042)
    if showDebug:
      print("[ledMatrixBridge] Bridge Ready...")


#start process
if __name__ == '__main__':
  start()

  while appRunning:
    message = input()
    key = ""
    try:
      payload = json.loads(message)
      key = payload["key"]
    except:

      print('[ledMatrixBridge] json parse error', message)
    else:
      if showDebug:
        print("[ledMatrixBridge] key: " + key)

      sys.stdout.flush() 

      if key == "stop":
        if showDebug:
          print("[ledMatrixBridge] end python process")
        appRunning = False
        sys.exit()    

      if key == "setRotation":
        if showDebug:
          print("[ledMatrixBridge] set rotation", payload["value"])
        sense.set_rotation(payload["value"], True)        

      if key == "flipH":
        if showDebug:
          print("[ledMatrixBridge] flip horizontal")
        sense.flip_h(True)        

      if key == "flipV":
        if showDebug:
          print("[ledMatrixBridge] flip vertical")
        sense.flip_v(True)  

      if key == "setPixels":
        if showDebug:
          print("[ledMatrixBridge] set pixels from array")
        sense.set_pixels(payload["value"])          

      if key == "getPixels":
        if showDebug:
          print("[ledMatrixBridge] flip vertical")
        print(sense.get_pixels())

      if key == "setPixel":
        if showDebug:
          print("[ledMatrixBridge] set single pixel")
        sense.set_pixel(payload["x"], payload["y"], payload["r"], payload["g"], payload["b"])          

      if key == "getPixel":
        if showDebug:
          print("[ledMatrixBridge] get single pixel")
        print(sense.get_pixel(payload["x"], payload["y"]))     

      if key == "loadImage":
        if showDebug:
          print("[ledMatrixBridge] load image", payload["value"])
        sense.load_image(payload["value"], True)        

      if key == "clear":
        if showDebug:
          print("[ledMatrixBridge] clear pixels")
        sense.clear()   

      if key == "showMessage":
        if showDebug:
          print("[ledMatrixBridge] show message", payload['msg'])
        
        sense.show_message(payload["msg"], payload["speed"], payload["textColor"], payload["backgroundColor"])

      if key == "showLetter":
        if showDebug:
          print("[ledMatrixBridge] show letter", payload['value'])
        sense.show_letter(payload["value"])

      if key == "lowLight":
        if showDebug:
          print("[ledMatrixBridge] set low light", payload['value'])
        sense.low_light(bool(payload["value"]))

      if key == "gamma":
        if showDebug:
          print("[ledMatrixBridge] set gamma", payload['value'])
        sense.low_light(int(payload["value"]))

      if key == "gamma":
        if showDebug:
          print("[ledMatrixBridge] reset gamma")
        sense.gamma_reset()
