open module ai.swim {
  requires transitive swim.server;
  requires com.fazecast.jSerialComm;
  requires swim.client;
  requires com.microsoft.azure;

  exports ai.swim;

  provides swim.api.plane.Plane with ai.swim.Main;
}
