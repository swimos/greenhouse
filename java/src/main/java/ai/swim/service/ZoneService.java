package swim.greenhouse.service;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.MapLane;
import swim.structure.Value;


public class ZoneService extends AbstractAgent {

  /**
   * Use map lane to store latest data
   */
  @SwimLane("join/latest")
  MapLane<String, Value> joinLatest = this.<String, Value>mapLane()
    .didUpdate((k,n,o) -> {
      // System.out.println("Zone join update: " + k + ", " + n.toRecon());
    });

  /**
   * Use map lane to store latest data with host
   */
  @SwimLane("fullInfoLatest")
  MapLane<String, Value> fullInfoLatest = this.<String, Value>mapLane()
    .didUpdate((k, n, o) -> {
      // System.out.println("Zone full info update: " + k + ", " + n.toRecon());
    });

  /**
   * Command to receive Aggregate update
   */
  @SwimLane("addAgg")
  private CommandLane<Value> addAgg = this.<Value>commandLane()
    .onCommand(v -> {
      joinLatest.put(v.get("key").stringValue(), v.get("data"));
      if (!v.get("host").stringValue().isEmpty()) {
        fullInfoLatest.put(v.get("key").stringValue().concat("-").concat(v.get("host").stringValue()), v.get("data"));
      }
    });
}
