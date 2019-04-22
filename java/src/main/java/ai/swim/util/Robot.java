package ai.swim.util;

import swim.recon.Recon;
import swim.structure.Form;

import java.util.Objects;

public class Robot {
  private String status;
  private String name;
  private String destination;

  public Robot() {

  }

  public String getStatus() {
    return this.status;
  }

  public void setStatus(String status) {
    this.status = status;
  }

  public String getName() {
    return this.name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDestination() {
    return this.destination;
  }

  public void setDestination(String destination) {
    this.destination = destination;
  }

  @Override
  public boolean equals(Object other) {
    if (other instanceof Robot) {
      final Robot that = (Robot) other;
      return this.status.equals(that.status) && this.name.equals(that.name)
        && this.destination.equals(that.destination);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Objects.hash(this.status, this.name, this.destination);
  }

  @Override
  public String toString() { return Recon.toString(form().mold(this));}

  private static Form<Robot> form;

  public static Form<Robot> form() {
    if (form == null) {
      form = Form.forClass(Robot.class);
    }
    return form;
  }
}
