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

  @matchesState("dropdown.hours") dropdownHoursFocussed!: boolean;
  @matchesState("dropdown.minutes") dropdownMinutesFocussed!: boolean;
  @matchesState("dropdown.meridiem") dropdownMeridiemFocussed!: boolean;
  @matchesState("dropdown") dropdownOpen!: boolean;

  hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  minutes = MINUTES;

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
  dropdown() {
    interpreterFor(this.statechart).send({ type: "TOGGLE_DROPDOWN" });
  }

  @action
  select(input: string) {
    interpreterFor(this.statechart).send({ type: "SELECT", input });
  }

  @action
  selectMeridiem(input: Meridiem) {
    interpreterFor(this.statechart).send({ type: "SELECT_MERIDIEM", input });
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
