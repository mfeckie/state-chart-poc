import Controller from "@ember/controller";
import { tracked } from "@glimmer/tracking";

export default class TimeInput extends Controller {
  @tracked time = "11:40 AM";
  @tracked otherTime = "9:00 AM"
}
