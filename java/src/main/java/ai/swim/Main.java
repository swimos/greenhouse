package swim.greenhouse;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import swim.api.SwimRoute;
import swim.api.agent.AgentRoute;
import swim.api.plane.AbstractPlane;
import swim.api.space.Space;
import swim.codec.Utf8;
import swim.kernel.Kernel;
import swim.recon.Recon;
import swim.server.ServerLoader;
import swim.structure.Value;
import swim.uri.Uri;


public class Main extends AbstractPlane {

  /**
   * Main Class for starting Application and establishing SWIM Plane URI pattern to initialize SWIM Server
   */

  private static int PORT;
  public static int getSwimPort() { return PORT; }

  // define the uri for a service with @SwimRoute annotation. Specify dynamic portions of the route with a : prefix
  // All instances of the A service will have a URI of the form /a/:id
  // @SwimRoute("/sensor/:id")
  // final AgentType<?> sensorService = agentClass(SensorService.class);

  // @SwimRoute("/device")
  // final AgentType<?> deviceService = agentClass(DeviceService.class);

  // @SwimRoute("/bot/:id")
  // final AgentType<?> botService = agentClass(BotService.class);

  // @SwimRoute("/aggregate")
  // final AgentType<?> aggregateService = agentClass(AggregateService.class);

  // @SwimRoute("/zone")
  // final AgentType<?> zoneService = agentClass(ZoneService.class);

  /**
   * Main method to start Swim Server with recon configuration and SWIM Plane
   * @param args
   * @throws InterruptedException
   */
  public static void main(String[] args) throws InterruptedException, IOException {
    System.out.println(System.getenv("CONFIG"));
    // Load any system properties from a file
    loadConfig();

    // // Instantiate a swim server
    // final ServerRuntime server = new ServerRuntime();
    final Value structure = loadRecon("swim.config", "/server.recon");
    PORT = 9001;//structure.getItem(3).getAttr("http").get("port").intValue();
    // final ServerDef sd = ServerDef.form().cast(structure);
    System.out.println("Listening on port: " + PORT);
    // server.materialize(sd);

    // final PlaneContext plane = server.getPlane("greenhouse").planeContext();

    // // Run the swim server, this stays alive until termination
    // server.run();

    final Kernel kernel = ServerLoader.loadServer();
    final Space space = kernel.getSpace("greenhouse");

    kernel.start();
    System.out.println("Running Swim Plant Montior Server...");
    kernel.run();    

  //   /**
  //    * Block of local tests
  //    */
  //  space.command("/sensor/humidity", "unused", Value.fromObject("wakeup"));
  //  space.command("/sensor/temperature", "unused", Value.fromObject("wakeup"));

  //  //space.command("/bot/4", "status", Value.fromObject("WORKING"));
  //  space.command("/bot/4", "unused", Value.fromObject("wakeup"));
  //  space.command("/bot/5", "unused", Value.fromObject("wakeup"));

  //  Thread.sleep(1000);
  //  space.command("/sensor/humidity", "setThreshold", Value.fromObject(50));

  //  space.command("/sensor/humidity", "addLatest", Value.fromObject(48));
  //  space.command("/sensor/temperature", "addLatest", Value.fromObject(5));
  //  space.command("/bot/4", "addLatest", Value.fromObject(1));
  //  space.command("/bot/5", "addLatest", Value.fromObject(1));
  //  Thread.sleep(100);

  //  space.command("/sensor/humidity", "addLatest", Value.fromObject(49));
  //  space.command("/sensor/temperature", "addLatest", Value.fromObject(5));
  //  space.command("/bot/4", "addLatest", Value.fromObject(1));
  //  space.command("/bot/5", "addLatest", Value.fromObject(1));
  //  Thread.sleep(100);

  //  space.command("/sensor/humidity", "addLatest", Value.fromObject(50));
  //  space.command("/sensor/temperature", "addLatest", Value.fromObject(5));
  //  space.command("/bot/4", "addLatest", Value.fromObject(1));
  //  space.command("/bot/5", "addLatest", Value.fromObject(1));
  //  Thread.sleep(100);

  //  space.command("/sensor/humidity", "addLatest", Value.fromObject(49));
  //  space.command("/sensor/temperature", "addLatest", Value.fromObject(5));
  //  space.command("/bot/4", "addLatest", Value.fromObject(1));
  //  space.command("/bot/5", "addLatest", Value.fromObject(1));
  //  Thread.sleep(100);

  //  space.command("/sensor/humidity", "addLatest", Value.fromObject(52));
  //  space.command("/sensor/temperature", "addLatest", Value.fromObject(5));
  //  space.command("/bot/4", "addLatest", Value.fromObject(1));
  //  space.command("/bot/5", "addLatest", Value.fromObject(1));
  //  Thread.sleep(100);

  //  space.command("/sensor/humidity", "addLatest", Value.fromObject(48));
  //  space.command("/sensor/temperature", "addLatest", Value.fromObject(5));
  //  space.command("/bot/4", "addLatest", Value.fromObject(1));
  //  space.command("/bot/5", "addLatest", Value.fromObject(1));
  //  Thread.sleep(100);

  //  space.command("/sensor/humidity", "addLatest", Value.fromObject(52));
  //  space.command("/sensor/temperature", "addLatest", Value.fromObject(5));
  //  space.command("/bot/4", "addLatest", Value.fromObject(1));
  //  space.command("/bot/5", "addLatest", Value.fromObject(1));
  //  Thread.sleep(100);

  //  space.command("/sensor/humidity", "addLatest", Value.fromObject(49));
  //  space.command("/sensor/temperature", "addLatest", Value.fromObject(5));
  //  space.command("/bot/4", "addLatest", Value.fromObject(1));
  //  space.command("/bot/5", "addLatest", Value.fromObject(1));
  //  Thread.sleep(100);

  //  space.command("/sensor/humidity", "addLatest", Value.fromObject(49));
  //  space.command("/sensor/temperature", "addLatest", Value.fromObject(5));
  //  space.command("/bot/4", "addLatest", Value.fromObject(1));
  //  space.command("/bot/5", "addLatest", Value.fromObject(1));
  //  Thread.sleep(100);

  //  for (int i = 1; i < 100; i++) {
  //    space.command("/sensor/light", "addLatest", Value.fromObject(i));
  //    space.command("/sensor/soil", "addLatest", Value.fromObject(i));
  //    space.command("/sensor/temperatureCh1", "addLatest", Value.fromObject(i));
  //    Thread.sleep(100);
  //  }

    // doSerial(space);
  }

  /**
   * For now we don't set up serial port in Java, but receive all messages from node
   */
  // private static void doSerial(PlaneContext plane) {
  //   final String serialPort = System.getProperty("serial.port", "");
  //   if (!serialPort.isEmpty()) {
  //     // Polls forever in the main thread
  //     new SerialReader(plane, serialPort).poll();
  //   } else {
  //     System.out.println("[WARN] No serial property found. Serial feed to SWIM must now be provided by another process");
  //   }
  // }


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
        System.out.println(propFileLocation);
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
