package ai.swim.service;

import ai.swim.Main;
import java.util.Map;
import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.JoinValueLane;
import swim.api.lane.MapLane;
import swim.api.lane.ValueLane;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;


public class BotService extends AbstractAgent {

  private boolean iniJoin = false;

  // FIXME: Remove function when core is fixed.
  public Uri hostUriHack() {
    return Uri.parse(
      "ws://" +
        System.getProperty("device.host.uri", "localhost") +
        ":" + Main.getSwimPort());
  }

  /**
   * Value lane that stores robot's name. Value type: String
   */
  @SwimLane("name")
  ValueLane<String> name = valueLane();

  /**
   * MapLane that stores robot new sensor task address,
   * including:
   *       "deviceHost", "deviceName", "sensorUri"
   */
  @SwimLane("destination")
  MapLane<String, String> destination = this.<String, String>mapLane()
    .didUpdate((k, n ,o ) -> {
      // System.out.println("Bot new Destination join update: " + k + ", " + n);
    });

  /**
   * Use value lane to store what type of task robot get assigned
   * including:
   *        "TEMP", "WATER", "LIGHT", "REST"
   */
  @SwimLane("workType")
  ValueLane<String> workType = this.<String>valueLane()
    .didSet((n, o) -> {
      // System.out.println("Robot work Type: " + n);
    });

  /**
   * Use value lane to store Plant (Device) name that bot is going to work on
   */
  @SwimLane("plantName")
  ValueLane<String> plantName = valueLane();
        
  /**
   * Use value lane to store the current status of robot, either AVAILABLE or WORKING
   */
  @SwimLane("status")
  ValueLane<String> status = this.<String>valueLane()
    .didSet((n, o) -> {
      // System.out.println("Robot status: " + n);
      if (n.equals("WORKING")) {
      }
    });

  /**
   * Initial entry point for robot to receive new task
   *
   * When receive new task, update destination map lane, planeName value lane, call startWork()
   *
   * Meanwhile update Device, which contains sensor that need to work on.
   */
  @SwimLane("addDestination")
  CommandLane<Value> addDestination = this.<Value>commandLane()
    .onCommand(v -> {
      String deviceHost = v.get("deviceHost").stringValue();
      String deviceName = v.get("deviceName").stringValue();
      String sensorUri = v.get("sensorUri").stringValue();

      destination.put("deviceHost", deviceHost);
      destination.put("deviceName", deviceName);
      destination.put("sensorUri", sensorUri);

      String[] nameOnly = deviceName.split("\\|");
      plantName.set(nameOnly[0]);

      status.set("WORKING");
      startWork();

      Record r = Record.create(4)
        .slot("robotHost", hostUriHack().toString())
        .slot("robotNode", nodeUri().toString())
        .slot("robotName", System.getProperty("device.name", ""))
        .slot("sensorUri", sensorUri);

      // command to device with robot info and sensor that bot working on
      command(deviceHost, "/device", "addRobot", r);

    });

  /**
   * Identify the work type that bot is going to work on
   */
  private void startWork() {
    String destSensor = destination.get("sensorUri");
    if (destSensor.contains("temp")) {
      // System.out.println("Turn on Heater");
      workType.set("TEMP");
    } else if (destSensor.contains("soil")) {
      // System.out.println("Watering");
      workType.set("WATER");
    } else if (destSensor.contains("light")) {
      // System.out.println("Turn on Light");
      workType.set("LIGHT");
    }
  }

  /**
   * Use value lane to store robot's sensor value
   */
  @SwimLane("latest")
  private ValueLane<Value> latest = valueLane();

  /**
   * JoinValueLane downlink to Sensor Service to indicate that robot is operating
   */
  @SwimLane("join/latest")
  private JoinValueLane<String, Integer> joinLatest = this.<String, Integer>joinValueLane()
    .didUpdate((k,n,o) -> {
      // System.out.println("Robot join update: " + k + ", " + n);
      final Record r = Record.of();
      for (Map.Entry<String, Integer> entry : this.joinLatest.entrySet()) {
        r.slot(entry.getKey(), entry.getValue());
      }
      latest.set(r);
      if (!iniJoin) {
        iniSetUp();
        doJoin();
        iniJoin = true;
      }
    });

  /**
   * command lane to receive sensor data from Sensor Service and update to "join/latest" JoinValueLane
   */
  @SwimLane("addSensor")
  private CommandLane<Value> addSensor = this.<Value>commandLane()
    .onCommand(v -> {
      final String key = v.stringValue();
      joinLatest.downlink(key)
        .nodeUri("/sensor/"+key)
        .laneUri("latest")
        .open();
    });

  /**
   * when command lane get updated, set robot status to be "AVAILABLE", clear destination and plantName, and set
   * workType to "REST"
   */
  @SwimLane("taskFinish")
  CommandLane<Value> taskFinish = this.<Value>commandLane()
    .onCommand(v -> {
      status.set("AVAILABLE");
      destination.remove("deviceHost");
      destination.remove("deviceName");
      destination.remove("sensorUri");
      plantName.set("");
      workType.set("REST");
    });

  void iniSetUp() {
    name.set(getProp("id").stringValue());
    if (status.get().isEmpty()) {
      status.set("AVAILABLE");
    }
  }

  /**
   * Helper method to send robot info to Aggregate Service
   */
  private void doJoin(){

    final String aggHost = System.getProperty("aggregate.host.uri", "");
    if (aggHost.isEmpty()) {
      command("/aggregate", "addBot", Record.of()
        .slot("node", nodeUri().toString())
        .slot("key", System.getProperty("device.name", "")));
    } else {
      command(aggHost, "/aggregate", "addBot", Record.of()
        .slot("host", hostUriHack().toString()) // ws://192.168.0.151:5620
        .slot("node", nodeUri().toString()) // /bot/6
        .slot("key", System.getProperty("device.name", "")));// RaspiBot6|192.168.0.151:5620
    }
  }

}
