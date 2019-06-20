package ai.swim.service;

import ai.swim.Main;
import java.util.Map;

import ai.swim.util.TimeUtil;
import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.JoinValueLane;
import swim.api.lane.MapLane;
import swim.api.lane.ValueLane;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Text;
import swim.structure.Value;
import swim.uri.Uri;

public class AggregateService extends AbstractAgent {

  private static final int ALERT_HISTORY_SIZE = 10;
  private static final int AVG_SIZE = 10;

  private boolean iniJoin = false;

  // FIXME: Remove function when core is fixed.
  public Uri hostUriHack() {
    return Uri.parse(
      "ws://" +
        System.getProperty("device.host.uri", "localhost") +
        ":" + Main.getSwimPort());
  }

  /**
   * Use map lane to store Aggregate of all device latest read in
   */
  @SwimLane("aggLatest")
  MapLane<String, Value> aggLatest = this.<String, Value>mapLane()
    .didUpdate((k, n, o) -> {
      final Record r = Record.of();
      for (Map.Entry<String, Value> entry : this.aggLatest.entrySet()) {
        r.slot(entry.getKey(), entry.getValue());
      }
      if (!iniJoin) {
        doJoin(r);
        iniJoin = true;
      }
    });

  /**
   * Following snippets of Swim Lanes represent Avg. sensor data on Aggregate Monitor page
   */

  @SwimLane("avg/light")
  MapLane<Long, Integer> avgLight = this.<Long, Integer>mapLane()
    .didUpdate((k, n, o) -> {
      // System.out.println("receive light: " + n);
      if (this.avgLight.size() > AVG_SIZE) {
        TimeUtil.removeRecord(this.avgLight, this.avgLight.size() - AVG_SIZE);
        //this.avgLight.drop(this.avgLight.size() - AVG_SIZE);
      }
    });

  @SwimLane("avg/soil")
  MapLane<Long, Integer> avgSoil = this.<Long, Integer>mapLane()
    .didUpdate((k, n, o) -> {
      // System.out.println("receive soil: " + n);
      if (this.avgSoil.size() > AVG_SIZE) {
        TimeUtil.removeRecord(this.avgSoil, this.avgSoil.size() - AVG_SIZE);
        //this.avgSoil.drop(this.avgSoil.size() - AVG_SIZE);
      }
    });

  @SwimLane("avg/temp")
  MapLane<Long, Integer> avgTemp = this.<Long, Integer>mapLane()
    .didUpdate((k, n, o) -> {
      // System.out.println("receive temp: " + n);
      if (this.avgTemp.size() > AVG_SIZE) {
        TimeUtil.removeRecord(this.avgTemp, this.avgTemp.size() - AVG_SIZE);
        //this.avgTemp.drop(this.avgTemp.size() - AVG_SIZE);
      }
    });

  //TODO: NEED TO CREATE A SWIM VALUE/MAP LANE THAT CONTAIN ALL THE DEVICE AND ROBOT ATTACHED TO THIS AGGREGATE

  /**
   * Following snippets present the latest read-in from Device attached to Aggregate
   */

  @SwimLane("join/latest")
  JoinValueLane<String, Value> joinLatest = this.<String, Value>joinValueLane()
    .didUpdate((k,n,o) -> {
      // System.out.println("Aggregate join update: " + k + ", " + n.toRecon());
      long tm = System.currentTimeMillis();
      Integer light = 0;
      Integer soil = 0;
      Integer temperatureCh1 = 0;
      for (Map.Entry<String, Value> entry : this.joinLatest.entrySet()) {
        light += entry.getValue().get("light").intValue();
        soil += entry.getValue().get("soil").intValue();
        temperatureCh1 += entry.getValue().get("temperatureCh1").intValue();
      }
      avgLight.put(tm, light / this.joinLatest.size());
      avgSoil.put(tm, soil / this.joinLatest.size());
      avgTemp.put(tm, temperatureCh1 / this.joinLatest.size());

      aggLatest.put(k, n);
    });

  @SwimLane("addDevice")
  private CommandLane<Value> addDevice = this.<Value>commandLane()
    .onCommand(v -> {
      final Value host = v.get("host");
        if (host.isDefined()) {
          joinLatest.downlink(v.get("key").stringValue())
            .hostUri(host.stringValue())
            .nodeUri(v.get("node").stringValue())
            .laneUri("latest")
            .open();
        } else {
          joinLatest.downlink(v.get("key").stringValue())
            .nodeUri(v.get("node").stringValue())
            .laneUri("latest")
            .open();
        }
    });

  /**
   * Following snippets present the latest read-in from Robot attached to Aggregate
   */

  @SwimLane("join/robot")
  protected JoinValueLane<Value, String> joinRobot = this.<Value, String>joinValueLane()
    .didUpdate((k, n, o) -> {
      // System.out.println("Aggregate join Robot update: " + k.toRecon() + ", " + n);
      aggLatest.put(k.get("key").stringValue(), Text.from(n));
    });

  @SwimLane("addBot")
  private CommandLane<Value> addBot = this.<Value>commandLane()
    .onCommand(v -> {
      final Value host = v.get("host");
      if (host.isDefined()) {
        joinRobot.downlink(v)
          .hostUri(host.stringValue())
          .nodeUri(v.get("node").stringValue())
          .laneUri("status")
          .open();
      } else {
        joinRobot.downlink(v)
          .nodeUri(v.get("node").stringValue())
          .laneUri("status")
          .open();
      }
    });

  /**
   * createTask presents the task creation and assignment based on sensor alert and bots' availabilities
   */

  @SwimLane("createTask")
  private CommandLane<String> createTask = this.<String>commandLane()
    .onCommand(n -> {
      // ws://192.168.0.212:5620_RaspiPlant12|192.168.0.212:8080-light
      Record r = Record.of();
      String[] dest = n.split("-");
      String secondSplit = dest[0];
      String destSensor = dest[1]; // light

      String[] device = secondSplit.split("_");
      String deviceHost = device[0]; // ws://192.168.0.212:5620_
      String deviceName = device[1]; // RaspiPlant12|192.168.0.212:8080


      r.slot("deviceHost", deviceHost);   // ws://192.168.0.150:5620
      r.slot("deviceName", deviceName);   // RaspiPlant10|192.168.0.116:8080
      r.slot("sensorUri", "/sensor/" + destSensor); // /sensor/temp4

      // robotAssigned

      for (Map.Entry<Value, String> entry : joinRobot.entrySet()) {
        // if (entry.getValue().equals("AVAILABLE")) {
          // System.out.println("***** Task needed to work on alert on: " + n + "*****");
          // call addDestination in Bot to work here with String.split.get hostUri.
          command(entry.getKey().get("host").stringValue(), entry.getKey().get("node").stringValue(), "addDestination", r);
          // System.out.println("Bot picked: " + entry.getKey().get("node").stringValue());
          break;
        }
      }
    });

  /**
   * Following snippets present the lane alerts from sensors
   */

  @SwimLane("totalAlert")
  ValueLane<Integer> totalAlert = valueLane();

  @SwimLane("alert/history")
  MapLane<Long, Integer> alertHistory = this.<Long, Integer>mapLane()
    .didUpdate((key, newValue, oldValue) -> {
      if (this.alertHistory.size() > ALERT_HISTORY_SIZE) {
        TimeUtil.removeRecord(this.alertHistory, this.alertHistory.size() - ALERT_HISTORY_SIZE);
        //this.alertHistory.drop(this.alertHistory.size() - ALERT_HISTORY_SIZE);
      }
    });

  /**
   * Use map lane to store each sensor's alert status
   * e.g. {ws://192.168.1.92:5620-RaspiPlant4|192.168.1.92:8080-temp4: T/F}
   */
  @SwimLane("alert")
  protected MapLane<String, Boolean> alert = this.<String, Boolean>mapLane()
    .didUpdate((k, n, o) -> {
      // System.out.println("Aggregate alert update: " + k + ", " + n);
      long tm = System.currentTimeMillis();
      Integer sum = 0;
      for (Map.Entry<String, Boolean> entry : this.alert.entrySet()) {
        if (entry.getValue()) {
          sum += 1;
        }
      }
      totalAlert.set(sum);
      alertHistory.put(tm, sum);
    });

  @SwimLane("join/alert")
  JoinValueLane<String, Value> joinAlert = this.<String, Value>joinValueLane()
    .didUpdate((k,n,o) -> {
      // System.out.println("Aggregate join/alert update: " + k + ", " + n.toRecon());
      for (Map.Entry<String, Value> entry : this.joinAlert.entrySet()) {
        for (Item v : entry.getValue()) {
          alert.put(entry.getKey().concat("-").concat(v.key().stringValue()), v.toValue().booleanValue());
        }
      }
    });

  @SwimLane("addAlert")
  private CommandLane<Value> addAlert = this.<Value>commandLane()
    .onCommand(v -> {
      final Value host = v.get("host"); // device.host.uri=192.168.0.150:5620
      if (host.isDefined()) {
        joinAlert.downlink(v.get("key").stringValue()) //RaspiPlant4|192.168.0.150:8080
          .hostUri(host.stringValue())
          .nodeUri(v.get("node").stringValue())  //  /device
          .laneUri("alert")
          .open();
      } else {
        joinAlert.downlink(v.get("key").stringValue())
          .nodeUri(v.get("node").stringValue())
          .laneUri("alert")
          .open();
      }
    });

  /**
   * When "needWork" get updated from false to true, send command to createTask
   */
  @SwimLane("needWork")
  protected MapLane<String, Boolean> needWork = this.<String, Boolean>mapLane()
    .didUpdate((k, n , o) -> {
      //FIXME: Need to add timer for case have needWork for a long time
      if (n && !o) {
        // System.out.println("Message from Aggregate" + k + " needs work on " + n.toString());
        // createTask.set(k);
        command(nodeUri().toString(), "createTask", Text.from(k));
      }
    });

  @SwimLane("join/addWork")
  JoinValueLane<String, Value> joinAddWork = this.<String, Value>joinValueLane()
    .didUpdate((k, n, o) -> {
      for (Map.Entry<String, Value> entry : this.joinAddWork.entrySet()) {
        for (Item v : entry.getValue()) {
          needWork.put(entry.getKey().concat("-").concat(v.key().stringValue()), v.toValue().booleanValue());
        }
      }
    });


  @SwimLane("addWork")
  private CommandLane<Value> addWork = this.<Value>commandLane()
    .onCommand(v -> {
      final Value host = v.get("host");
      if (host.isDefined()) {
        String str = v.get("host").stringValue().concat("_").concat(v.get("key").stringValue());
        joinAddWork.downlink(str)
          .hostUri(host.stringValue())
          .nodeUri(v.get("node").stringValue())
          .laneUri("needWork")
          .open();
      } else {
        joinAddWork.downlink(v.get("key").stringValue())
          .nodeUri(v.get("node").stringValue())
          .laneUri("needWork")
          .open();
      }
    });

  /**
   * Update Aggregate info and data to zone service
   */
  private void doJoin(Value r) {
    final String aggHost = System.getProperty("aggregate.host.uri", "");
    if (aggHost.isEmpty()) {
      command("/zone", "addAgg", Record.of()
        .slot("node", nodeUri().toString())
        .slot("key", System.getProperty("device.name", ""))
        .slot("data", r));
    } else {
      command(aggHost, "/zone", "addAgg", Record.of()
        .slot("host", hostUriHack().toString()) // device.host.uri= ws://192.168.0.150:5620
        .slot("node", nodeUri().toString()) // /aggregate
        .slot("key", System.getProperty("device.name", "")) //RaspiAgg4|192.168.0.150:5620
        .slot("data", r));
    }
  }

}
