import { action } from "@ember/object";
import { matchesState, useMachine, interpreterFor } from "ember-statecharts";
import { Meridiem, TimeContext, TimeMachine } from "./time-machine";
import { use } from "ember-usable";
import Component from "@glimmer/component";

interface HTimeInputArgs {
  hours: number;
  minutes: number;
  meridiem: Meridiem;
  onChange: (time: string) => void;
}

const keysToAllow = ["Tab", "Shift", "ArrowLeft", "ArrowRight", "Backspace"];

export default class HDateInput extends Component<HTimeInputArgs> {
  @use statechart = useMachine(TimeMachine)
    .withContext({
      hours: this.args.hours,
      minutes: this.args.minutes,
      meridiem: this.args.meridiem,
    })
    .withConfig({
      actions: {
        onChange: this.onChange,
      },
    })
    .update(({ restart }) => restart());

  @matchesState("meridiem.focussed") meridiemFocussed!: boolean;
  @matchesState("minutes.focussed") minutesFocussed!: boolean;
  @matchesState("hours.focussed") hoursFocussed!: boolean;

  @action
  up() {
    interpreterFor(this.statechart).send("INCREMENT");
  }

  @action
  down() {
    interpreterFor(this.statechart).send("DECREMENT");
  }

  @action
  focus() {
    interpreterFor(this.statechart).send("FOCUS");
  }

  @action
  focusHours() {
    interpreterFor(this.statechart).send("HOURS");
  }

  @action
  focusMinutes() {
    interpreterFor(this.statechart).send("MINUTES");
  }

  @action
  focusMeridiem() {
    interpreterFor(this.statechart).send("MERIDIEM");
  }

  @action
  blur() {
    interpreterFor(this.statechart).send("BLUR");
  }

  @action
  tab() {
    interpreterFor(this.statechart).send("TAB");
  }

  @action
  validate() {
    interpreterFor(this.statechart).send("VALIDATE");
  }

  @action
  onChange({ hours, minutes, meridiem }: TimeContext) {
    this.args.onChange(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${meridiem}`
    );
  }

  @action
  keyDown(event: KeyboardEvent): boolean | undefined | void {
    if (keysToAllow.includes(event.key)) {
      return;
    }

    if (!event.key.toString().match(/\d+/)) {
      event.preventDefault();
      return false;
    }
  }

  @action
  input(event: InputEvent) {
    interpreterFor(this.statechart).send("USER_INPUT", {
      input: (event?.target as HTMLInputElement)?.value,
    });
  }

  get paddedMinutes() {
    return interpreterFor(this.statechart)
      .state.context.minutes?.toString()
      .padStart(2, "0");
  }
}
