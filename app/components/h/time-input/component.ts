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

const MINUTES = [...Array(60).keys()];

export default class HDateInput extends Component<HTimeInputArgs> {
  @use statechart = interpreterFor(
    useMachine(TimeMachine)
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
      .update(({ restart }) => restart())
  );

  @matchesState("meridiem.focussed") meridiemFocussed!: boolean;
  @matchesState("minutes.focussed") minutesFocussed!: boolean;
  @matchesState("hours.focussed") hoursFocussed!: boolean;

  @matchesState("dropdown.hours") dropdownHoursFocussed!: boolean;
  @matchesState("dropdown.minutes") dropdownMinutesFocussed!: boolean;
  @matchesState("dropdown.meridiem") dropdownMeridiemFocussed!: boolean;
  @matchesState("dropdown") dropdownOpen!: boolean;

  hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  minutes = MINUTES;

  @action
  up() {
    this.statechart.send({ type: "INCREMENT" });
  }

  @action
  down() {
    this.statechart.send({ type: "DECREMENT" });
  }

  @action
  focus() {
    this.statechart.send({ type: "FOCUS" });
  }

  @action
  focusHours() {
    this.statechart.send({ type: "HOURS" });
  }

  @action
  focusMinutes() {
    this.statechart.send({ type: "MINUTES" });
  }

  @action
  focusMeridiem() {
    this.statechart.send({ type: "MERIDIEM" });
  }

  @action
  blur() {
    this.statechart.send({ type: "BLUR" });
  }

  @action
  tab() {
    this.statechart.send({ type: "TAB" });
  }

  @action
  validate() {
    this.statechart.send({ type: "VALIDATE" });
  }

  @action
  dropdown() {
    this.statechart.send({ type: "TOGGLE_DROPDOWN" });
  }

  @action
  select(input: string) {
    this.statechart.send({ type: "SELECT", input });
  }

  @action
  selectMeridiem(input: Meridiem) {
    this.statechart.send({ type: "SELECT_MERIDIEM", input });
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
    this.statechart.send("USER_INPUT", {
      input: (event?.target as HTMLInputElement)?.value,
    });
  }

  get paddedMinutes() {
    return this.statechart.state.context.minutes?.toString().padStart(2, "0");
  }
}
