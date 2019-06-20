package ai.swim.service;

import ai.swim.util.TimeUtil;
import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.MapLane;
import swim.api.lane.ValueLane;
import swim.concurrent.TimerRef;
import swim.recon.Recon;
import swim.streamlet.In;
import swim.structure.Value;

public class SensorService extends AbstractAgent {

  /**
   * Baseline Service for both Plant and Bot services. SensorService initialized and activated when sensors start
   * receiving signal
   */

  private static final int HISTORY_SIZE = 400;
  private static final int SHORT_HISTORY_SIZE = 100;
  private static final int ALERT_HISTORY_SIZE = 10;

  private boolean initJoin = false;
  private TimerRef sampleTimer;

  /**
   * ValueLane stores Integer data, which received from addLatest command lane
   * Initializes sending info to either Plant or Robot
   *
   * didSet is called when the ValueLane gets updated with a new value
   */
  @SwimLane("latest")
  ValueLane<Float> latest = this.<Float>valueLane()
    .didSet((n, o) -> {
      if (!initJoin) {
        sendToDeviceBot();
        // System.out.println("ACK: sensor int update : ");
        // System.out.println(getProp("id"));
        // System.out.println(n);
        initJoin = true;
      }
    })
    .isTransient(true);

  /**
   * Use map lane to store history of sensor data. Key: Long type of timestamp, Value: Integer type of sensor data
   *
   * Collect 1 day size data
   *
   * didUpdate is called when the MapLane gets updated
   */
  @SwimLane("history")
  MapLane<Long, Float> history = this.<Long, Float>mapLane()
    .didUpdate((key, newValue, oldValue) -> {
      if (this.history.size() > HISTORY_SIZE) {
        this.history.remove(this.history.getIndex(0).getKey());
      }
    })
    .isTransient(true);

  /**
   * Use map lane to store short history of sensor data. Here only store 100 set data
   *
   * didUpdate is called when the MapLane gets updated
   */
  @SwimLane("shortHistory")
  MapLane<Long, Float> shortHistory = this.<Long, Float>mapLane()
    .didUpdate((key, newValue, oldValue) -> {
      if (this.shortHistory.size() > SHORT_HISTORY_SIZE) {
        this.shortHistory.remove(this.shortHistory.getIndex(0).getKey());
      }
    })
    .isTransient(true);

  /**
   * Use a value lane to store threshold for current sensor.
   *
   * didSet is called when the ValueLane gets updated with a new value
   */
  @SwimLane("threshold")
  ValueLane<Float> threshold = valueLane();

  /**
   * Use a command lane to receive sensor threshold from UI setting, data type: Integer
   *
   */
  @SwimLane("setThreshold")
  CommandLane<Float> setThreshold = this.<Float>commandLane()
    .onCommand(t -> {
      threshold.set(t);
    });

  /**
   * Use a value lane to store option. The class type of the item needs to be specified
   * In this case store value lane is of the type Integer.
   *
   * didSet is called when the ValueLane gets updated with a new value
   */
  @SwimLane("option")
  ValueLane<Integer> option = valueLane();

  /**
   * Use a command lane to receive sensor option from UI setting, triggered when hit on light icon on page
   * data type: Integer
   */
  @SwimLane("setOption")
  CommandLane<Integer> setOption = this.<Integer>commandLane()
    .onCommand(t -> {
      option.set(t);
    });

  /**
   * Value Lane stores robot info (robot Host, node, name) that get assigned on current Sensor
   * data type: Value
   */
  @SwimLane("robotAssigned")
  ValueLane<Value> robotAssigned = this.<Value>valueLane()
    .didSet((n, o) -> {
      // System.out.println("ACK: Robot assigned to this Sensor based on Alert: " + getProp("id").toString() + " : " + Recon.toString(n));
    });

  /**
   * Use command Lane to receive assigned robot info from Plant (DeviceService)
   */
  @SwimLane("robotAck")
  CommandLane<Value> robotAck = this.<Value>commandLane()
    .onCommand(v -> {
      robotAssigned.set(v);
    });

  /**
   * Section with timer to check status of sensor data after alert get cancelled.
   *
   * Send taskFinish to Plant after 30 seconds monitor
   */
  // When receive new taskFinish signal check with method: checkWorkResult
  @SwimLane("taskFinish")
  ValueLane<Boolean> taskFinish = this.<Boolean>valueLane()
    .didSet(this::checkWorkResult);

  // reset timer every time when it receive taskFinish: true and previous taskFinish: false
  private void checkWorkResult(Boolean newValue, Boolean oldValue) {
    if (newValue && !oldValue) {
      // reset();
      // sampleTimer = setTimer(30000, this::finishSignal);
      finishSignal();
    }
  }

  private void finishSignal() {
    sendToDevice();
    reset();
  }

  // when alert cancelled stay longer than 30 seconds, send command to Plant device, and the id of sensor that
  // finished task
  private void sendToDevice() {
    if (System.getProperty("device.name", "").contains("Plant")) {
      command("/device", "taskFinish", getProp("id"));
    }
    robotAssigned.set(Value.absent());
  }

  // reset timer
  public void reset() {
    if (sampleTimer != null) {
      sampleTimer.cancel();
      sampleTimer = null;
    }
  }

  /**
   * Use a value value to store alert on current sensor.
   * data type: Boolean
   *
   * If new value read is false and previous old value is true, then indicates task is Finish. Set taskFinish value
   * lane to true, otherwise false.
   *
   */
  @SwimLane("alert")
  ValueLane<Boolean> alert = this.<Boolean>valueLane()
    .didSet((n, o) -> {
      if (!n && o) {
        taskFinish.set(true);
      } else taskFinish.set(false);

      setNeedWork();

    });

  /**
   * Use a map lane to store a keyed collection of data items of a specific type. The class type of the key and the
   * data item needs to be specified
   *
   * In this case store the key to the map lane is of type Long and the value of the map lane is of type Integer
   *
   * didUpdate is called when the MapLane gets updated
   */
  @SwimLane("alertHistory")
  MapLane<Long, Integer> alertHistory = this.<Long, Integer>mapLane()
    .didUpdate((key, newValue, oldValue) -> {
      if (this.alertHistory.size() > ALERT_HISTORY_SIZE) {
        TimeUtil.removeRecord(this.alertHistory, this.alertHistory.size() - ALERT_HISTORY_SIZE);
        //this.alertHistory.drop(this.alertHistory.size() - ALERT_HISTORY_SIZE);
      }
    });

  /**
   * Create Alert helper method to monitor device under certain sensor status.
   *
   */
  void checkAlert(Long tm, Float v) {
    // FIXME: set alert when sensor is below or equal to threshold for now, possible need to set alert when sensor is above threshold in certain circumstance.
    if (v <= threshold.get()) {
      alert.set(true);
      alertHistory.put(tm, 1);
    } else {
      alert.set(false);
      alertHistory.put(tm, 0);
    }
  }

  /**
   *
   * Zero entry point for back-end application where use command Lane to receive command from server.js
   * sendSensorDataCommand function.
   *
   * addLatest command lane take Integer data type, onCommand is called when CommandLane gets updated with a new value
   *
   */
  @SwimLane("addLatest")
  CommandLane<Float> addLatest = this.<Float>commandLane()
    .onCommand(i -> {
      // update latest value lane to store latest read-in value
      latest.set(i);
      final long now = System.currentTimeMillis();
      // update map lane with timestamp and read in data
      // notice: only last read in 5 minutes period will be stored
      history.put(now, i);
      // update short history
      shortHistory.put(now, i);
      // check whether last read-in data actually raises alert
      checkAlert(now, i);
    });

  /**
   * check whether have robot already assigned on current problem. If not, set that this sensor need work
   */
  private void setNeedWork() {
    Value v = robotAssigned.get();
    // Set NeedWork when has alert but not robot assigned to sensor, keep logic here
    if (alert.get() && !v.isDefined()) {
      needWork.set(true);
    } else needWork.set(false);
  }

  /**
   * store in value lane with data type Boolean that whether current sensor needs new robot to work on
   */
  @SwimLane("needWork")
  ValueLane<Boolean> needWork = this.<Boolean>valueLane()
    .didSet((n, o) -> {
    //  if (n) {
    //    System.out.println("Work Need for Sensor: /sensors/" + prop("id").toRecon() + n.toString());
       
    //  }
    });

  /**
   * Relay latest, alert and needWork to either Plant or robot depends on the device.name from properties
   */
  private void sendToDeviceBot() {
    if (System.getProperty("device.name", "").contains("Plant")){
      command("/device", "addSensor", getProp("id"));
    }
    else if (System.getProperty("device.name", "").contains("Bot")) {
      String[] split = System.getProperty("device.name").split("\\|");
      String id = split[0];
      command("/bot/" + id, "addSensor", getProp("id"));
    }
  }
}
