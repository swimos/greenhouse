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

// azure libs
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Writer;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.channels.AsynchronousFileChannel;
import java.nio.channels.FileChannel;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.security.InvalidKeyException;

import com.microsoft.azure.storage.*;
import com.microsoft.azure.storage.blob.*;
import com.microsoft.rest.v2.RestException;
import com.microsoft.rest.v2.util.FlowableUtil;


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

    // azure test code -----

    // Retrieve the credentials and initialize SharedKeyCredentials
    String accountName = System.getenv("AZURE_STORAGE_ACCOUNT");
    String accountKey = System.getenv("AZURE_STORAGE_ACCESS_KEY");
    String raspiConfig = System.getenv("RASPI_CONFIG");

    // Create a ServiceURL to call the Blob service. We will also use this to construct the ContainerURL
    SharedKeyCredentials creds = new SharedKeyCredentials(accountName, accountKey);

    // We are using a default pipeline here, you can learn more about it at https://github.com/Azure/azure-storage-java/wiki/Azure-Storage-Java-V10-Overview
    final ServiceURL serviceURL = new ServiceURL(new URL("https://" + accountName + ".blob.core.windows.net"), StorageURL.createPipeline(creds, new PipelineOptions()));

    // Let's create a container using a blocking call to Azure Storage
    // If container exists, we'll catch and continue
    containerURL = serviceURL.createContainerURL(raspiConfig);    

    try {
        ContainerCreateResponse response = containerURL.create(null, null, null).blockingGet();
        System.out.println("Container Create Response was " + response.statusCode() + ": " + raspiConfig + " created");
    } catch (RestException e){
        if (e instanceof RestException && ((RestException)e).response().statusCode() != 409) {
            throw e;
        } else {
            System.out.println("container already exists, resuming...");
        }
    }

    // Create a BlockBlobURL to run operations on Blobs
    final BlockBlobURL blobURL = containerURL.createBlockBlobURL("HelloBlob.txt");   
    System.out.println("blobUrl created");

    listBlobs();
  }


  /**
   * Configuration Helper functions here to load recon or configuration from property
   */
  private static void loadConfig() {
    final String propFileLocation = System.getProperty("app.config", "/raspi-app.properties");
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

  static void listBlobs(ContainerURL containerURL) {
    // Each ContainerURL.listBlobsFlatSegment call return up to maxResults (maxResults=10 passed into ListBlobOptions below).
    // To list all Blobs, we are creating a helper static method called listAllBlobs,
    // and calling it after the initial listBlobsFlatSegment call
      ListBlobsOptions options = new ListBlobsOptions();
      options.withMaxResults(10);

      containerURL.listBlobsFlatSegment(null, options, null).flatMap(containerListBlobFlatSegmentResponse ->
          listAllBlobs(containerURL, containerListBlobFlatSegmentResponse))
          .subscribe(response-> {
              System.out.println("Completed list blobs request.");
              System.out.println(response.statusCode());
          });
  }  
}
