package ai.swim.service;

import ai.swim.Main;
import java.util.Map;
import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.JoinValueLane;
import swim.api.lane.MapLane;
import swim.api.lane.ValueLane;
import swim.recon.Recon;
import swim.structure.Bool;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;

public class DeviceService extends AbstractAgent {

  private boolean iniLatestJoin = false;
  private boolean iniAlertJoin = false;
  private boolean iniAddWork = false;

  // FIXME: Remove function when core is fixed.
  public Uri hostUriHack() {
    return Uri.parse(
      "ws://" +
        System.getProperty("device.host.uri", "localhost") +
        ":" + Main.getSwimPort());
  }

  /**
   * Use value lane to store all sensors and its latest sensor read-in within same device
   * data type: Value (record)
   */
  @SwimLane("latest")
  private ValueLane<Value> latest = valueLane();

  /**
   * JoinValueLane that downlink from SensorService "latest" lane, stored with
   * key: Sensor node, value: Sensor read-in Integer
   *
   */
  @SwimLane("join/latest")
  private JoinValueLane<String, Integer> joinLatest = this.<String, Integer>joinValueLane()
    .didUpdate((k,n,o) -> {
      // System.out.println("device join update: " + k + ", " + n);
      final Record r = Record.of();
      for (Map.Entry<String, Integer> entry : this.joinLatest.entrySet()) {
        r.slot(entry.getKey(), entry.getValue());
      }
      // update record to latest value lane
      latest.set(r);
      if (!iniLatestJoin) {
        sendToAggregate("addDevice");
        iniLatestJoin = true;
      }
    });


   /**
   * Use value lane to store the state of joystick
   * including:
   *        "pressed", "released", "held"
   */
  @SwimLane("joystickState")
  ValueLane<String> joystickState = this.<String>valueLane()
    .didSet((n, o) -> {
      // System.out.println("joystickState: " + n);
    });
 
  /**
   * Use a command lane to receive sensor threshold from UI setting, data type: Integer
   *
   */
  @SwimLane("setJoystickState")
  CommandLane<String> setJoystickState = this.<String>commandLane()
    .onCommand(t -> {
      joystickState.set(t);
    });

   /**
   * Use value lane to store direction (if any) 
   * that the sensehat joystick is being pressed
   * including:
   *        "up", "down", "left", "right", "middle"
   */
  @SwimLane("joystickDirection")
  ValueLane<String> joystickDirection = this.<String>valueLane()
    .didSet((n, o) -> {
      // System.out.println("joystickDirection: " + n);
    });
 
  /**
   * Use a command lane to receive sensor threshold from UI setting, data type: Integer
   *
   */
  @SwimLane("setJoystickDirection")
  CommandLane<String> setJoystickDirection = this.<String>commandLane()
    .onCommand(t -> {
      joystickDirection.set(t);
    });


  /**
   * Use value lane to store key-value pair of all sensors' alert with corresponding sensor node as key.
   */
  @SwimLane("alert")
  private ValueLane<Value> alert = valueLane();


  /**
   * Use JoinValueLane to store downlink from sensorServie alert value lane with key-value pair,
   * where key: sensor node, value: alert boolean value
   * e.g. "join/alert": key: temp4, value: true -> {temp4 : false, soil: true, light: false}
   *
   */
  @SwimLane("join/alert")
  private JoinValueLane<String, Boolean> joinAlert = this.<String, Boolean>joinValueLane()
    .didUpdate((k,n,o) -> {
      // System.out.println("alert join update: " + k + ", " + n);
      final Record r = Record.of();
      for (Map.Entry<String, Boolean> entry : this.joinAlert.entrySet()) {
        r.slot(entry.getKey(), entry.getValue());
      }
      alert.set(r);
      if (!iniAlertJoin) {
        sendToAggregate("addAlert");
        iniAlertJoin = true;
      }
    });

  /**
   * Use value lane to store key-value pair of all sensor's needWork signal with corresponding sensor node as key
   */
  @SwimLane("needWork")
  private ValueLane<Value> needWork = valueLane();

  /**
   * Use JoinValueLane to store donwlink from sensorService needWork value lane with key-value pair,
   * where key: sensor node, value: needWork boolean value
   *
   */
  @SwimLane("join/needWork")
  private JoinValueLane<String, Boolean> joinNeedWork = this.<String, Boolean>joinValueLane()
    .didUpdate((k, n, o) -> {
      // System.out.println("NeedWork join update: " + k + ", " + n.toString());
      final Record r = Record.of();
      for (Map.Entry<String, Boolean> entry : this.joinNeedWork.entrySet()) {
        r.slot(entry.getKey(), entry.getValue());
      }
      needWork.set(r);
      if (!iniAddWork) {
        sendToAggregate("addWork");
        iniAddWork = true;
      }
    });

  /**
   * Use map lane to store sensor and robot pair to indicate which robot is working on which sensor
   */
  @SwimLane("assignedRobot")
  MapLane<String, Value> assignedRobot = this.<String, Value>mapLane()
    .didUpdate((k, n, o) -> {
      // System.out.println("Device Assigned Robot join update: " + k + ", " + Recon.toString(n));
      command(k, "robotAck", n);
    });


  /**
   * CommandLane to receive new sensor-robot assignment pair and update to lane "assignedRobot"
   */
  @SwimLane("addRobot")
  CommandLane<Value> addRobot = this.<Value>commandLane()
    .onCommand(v -> {
      Record r = Record.of()
        .slot("robotHost", v.get("robotHost").stringValue())
        .slot("robotNode", v.get("robotNode").stringValue())
        .slot("robotName", v.get("robotName").stringValue());
      assignedRobot.put(v.get("sensorUri").stringValue(), r);
    });

  /**
   * Command Lane that open to receive command from Sensor Service method sendToDeviceBot()
   */
  @SwimLane("addSensor")
  private CommandLane<Value> addSensor = this.<Value>commandLane()
    .onCommand(v -> {
      final String key = v.stringValue();  // "temp4"
      joinLatest.downlink(key)
        .nodeUri("/sensor/"+key) //  "/sensor/temp4"
        .laneUri("latest")
        .open();
      joinAlert.downlink(key)
        .nodeUri("/sensor/"+key)
        .laneUri("alert")
        .open();
      joinNeedWork.downlink(key)
        .nodeUri("/sensor/"+key)
        .laneUri("needWork")
        .open();
    });

  /**
   * Command Lane called when sensor finished task.
   * When command Lane gets update, it looks up corresponding robot that worked on this sensor.
   * Then send command to task finished lane "taskFinish" to indicate this robot has finished its task
   */
  @SwimLane("taskFinish")
  private CommandLane<Value> taskFinish = this.<Value>commandLane()
    .onCommand(v -> {
      String key = "/sensor/" + v.stringValue();
      // System.out.println("***** Task Finished on: " + key + "*****");
      command(assignedRobot.get(key).get("robotHost").stringValue(),
        assignedRobot.get(key).get("robotNode").stringValue(),"taskFinish", Bool.from(true));
      assignedRobot.remove(key);
    });

  /**
   *
   * @param laneName
   * Helper function to Send Device Service lane to Aggregate
   *
   */
  private void sendToAggregate(String laneName) {
    final String aggHost = System.getProperty("aggregate.host.uri", "");
    if (aggHost.isEmpty()) {
      command("/aggregate", laneName, Record.create(2)
        .slot("node", nodeUri().toString())
        .slot("key", System.getProperty("device.name", "")));
    } else {
      command(aggHost, "/aggregate", laneName, Record.create(3)
        .slot("host", hostUriHack().toString()) // device.host.uri= ws://192.168.0.150:5620
        .slot("node", nodeUri().toString()) // /device
        .slot("key", System.getProperty("device.name", "")));  //RaspiPlant4|192.168.0.150:5620
    }
  }

}
