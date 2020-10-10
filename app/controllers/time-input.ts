import Controller from "@ember/controller";
import { tracked } from '@glimmer/tracking';

export default class TimeInput extends Controller {
  @tracked time = 'abc123';
}
