package ai.swim;

import ai.swim.service.AggregateService;
import ai.swim.service.BotService;
import ai.swim.service.DeviceService;
import ai.swim.service.SensorService;
import ai.swim.service.ZoneService;
import ai.swim.util.SerialReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;
import swim.api.SwimRoute;
import swim.api.agent.AgentType;
import swim.api.plane.AbstractPlane;
import swim.api.plane.PlaneContext;
import swim.codec.Utf8;
import swim.linker.ServerDef;
import swim.recon.Recon;
import swim.server.ServerRuntime;
import swim.structure.Value;

public class Main extends AbstractPlane {

  /**
   * Main Class for starting Application and establishing SWIM Plane URI pattern to initialize SWIM Server
   */

  private static int PORT;
  public static int getSwimPort() { return PORT; }

  // define the uri for a service with @SwimRoute annotation. Specify dynamic portions of the route with a : prefix
  // All instances of the A service will have a URI of the form /a/:id
  @SwimRoute("/sensor/:id")
  final AgentType<?> sensorService = agentClass(SensorService.class);

  @SwimRoute("/device")
  final AgentType<?> deviceService = agentClass(DeviceService.class);

  @SwimRoute("/bot/:id")
  final AgentType<?> botService = agentClass(BotService.class);

  @SwimRoute("/aggregate")
  final AgentType<?> aggregateService = agentClass(AggregateService.class);

  @SwimRoute("/zone")
  final AgentType<?> zoneService = agentClass(ZoneService.class);

  /**
   * Main method to start Swim Server with recon configuration and SWIM Plane
   */
  public static void main(String[] args) throws InterruptedException, IOException {
    System.out.println(System.getenv("CONFIG"));
    // Load any system properties from a file
    loadConfig();

    // Instantiate a swim server
    final ServerRuntime server = new ServerRuntime();
    final Value structure = loadRecon("swim.config", "/swimGreenhouse.recon");
    PORT = structure.getItem(3).getAttr("http").get("port").intValue();
    final ServerDef sd = ServerDef.form().cast(structure);
    System.out.println("Listening on port: " + PORT);
    server.materialize(sd);

    final PlaneContext plane = server.getPlane("greenhouse-demo").planeContext();

    // Run the swim server, this stays alive until termination
    server.run();

  }


  /**
   * Configuration Helper functions here to load recon or configuration from property
   */
  private static void loadConfig() {
    
    // final String propFileLocation = System.getProperty("app.config", "/raspi-app.properties");
    final String propFilePath = System.getProperty("app.config", "/raspi-app.properties");
    final String propFileLocation = propFilePath + System.getenv("CONFIG") + "-app.properties";
    System.out.println("Using config file:" + propFileLocation);
    final File propFile = new File(propFileLocation);
    Properties props = new Properties(System.getProperties());
    try {
      if (propFile.exists()) {
        props.load(new FileInputStream(propFile));
      } else {
        props.load(Main.class.getResourceAsStream(propFileLocation));
      }
    } catch (IOException e) {
      System.out.println("[WARN] No properties file detected");
    }
    System.setProperties(props);
  }

  private static Value loadRecon(String property, String defaultPath) throws IOException {
    final String path = getConfigPath(property, defaultPath);
    InputStream input = null;
    Value value;
    try {
      final File file = new File(path);
      if (file.exists()) {
        input = new FileInputStream(file);
      } else {
        input = Main.class.getResourceAsStream(path);
      }
      value = Utf8.read(Recon.structureParser().blockParser(), input);
    } finally {
      try {
        if (input != null) input.close();
      } catch (Exception ignored) {}
    }
    return value;
  }

  private static String getConfigPath(String property, String defaultPath) {
    String configPath = System.getProperty(property);
    if (configPath == null) {
      configPath = defaultPath;
    }
    return configPath;
  }

}
