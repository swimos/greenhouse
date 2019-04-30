package ai.swim.util;

import swim.api.lane.MapLane;

import java.util.Map;

public class TimeUtil {

  public static void removeRecord(MapLane<Long, Integer> lane, int thresholdSize) {
    Long threshTM = lane.getIndex(thresholdSize).getKey();
    for (Map.Entry<Long, Integer> entry: lane.entrySet()) {
      if (entry.getKey() < threshTM) {
        lane.remove(entry.getKey());
      }
    }
  }
}
