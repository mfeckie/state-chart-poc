import Component from "@glimmer/component";
import { inspect } from "@xstate/inspect";

export default class XStateInspector extends Component {
  constructor(owner: unknown, args: any) {
    super(owner, args);
    this.setupInspector();
  }
  setupInspector() {
    inspect({ iframe: false });
  }
}
