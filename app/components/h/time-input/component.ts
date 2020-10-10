import Component from "@glimmer/component";
import { action } from "@ember/object";
import { matchesState, useMachine, interpreterFor } from "ember-statecharts";
import { Machine, assign, send } from "xstate";

import { use } from "ember-usable";

export enum Meridiem {
  AM = "AM",
  PM = "PM",
}

interface HTimeInputArgs {
  hours: number;
  minutes: number;
  meridiem: Meridiem;
  onChange: (time: string) => void;
}

function modHours(value: number) {
  if (value % 12 === 0) {
    return 12;
  } else {
    return value % 12;
  }
}

function modMinutes(value: number) {
  if (value < 0) {
    return 59;
  }
  return value % 60;
}

const keysToAllow = ["Tab", "Shift", "ArrowLeft", "ArrowRight", "Backspace"];

const timeMachine = Machine(
  {
    id: "time-machine",
    initial: "idle",
    context: {
      hours: 1,
      minutes: 1,
      meridiem: Meridiem.AM,
    },
    states: {
      idle: {
        on: {
          FOCUS: "focussed",
        },
      },
      focussed: {
        entry: [
          assign((context) => {
            return {
              hours: context.hours || 1,
              minutes: context.minutes || 0,
              meridiem: context.meridiem || Meridiem.AM,
            };
          }),
        ],
        on: {
          BLUR: "visited",
          TAB: "visited",
          HOURS: "hours",
          MINUTES: "minutes",
          MERIDIEM: "meridiem",
        },
      },
      visited: {
        always: [
          {
            target: "valid",
            cond: "isValid",
          },
          {
            target: "invalid",
          },
        ],
        on: {
          FOCUS: "focussed",
        },
      },
      valid: {
        entry: ["onChange"],
        on: {
          FOCUS: "focussed",
        },
      },
      invalid: {
        on: {
          FOCUS: "focussed",
        },
      },
      hours: {
        initial: "focussed",
        on: {
          MINUTES: "minutes",
          DONE: "visited",
        },
        states: {
          focussed: {
            on: {
              INCREMENT: {
                actions: assign({
                  hours: ({ hours }) => modHours(hours + 1),
                }),
              },
              DECREMENT: {
                actions: assign({
                  hours: ({ hours }) => modHours(hours - 1),
                }),
              },
              USER_INPUT: {
                actions: assign({
                  hours: ({ _hours }, { input }: { input: string }) => {
                    console.log(input);

                    if (input === "0" || input === "") {
                      return "";
                    }
                    return modHours(Number(input));
                  },
                }),
              },
              TAB: {
                actions: send("MINUTES"),
              },
              BLUR: {
                actions: send("DONE"),
              },
            },
          },
        },
      },
      minutes: {
        initial: "focussed",
        on: {
          MERIDIEM: "meridiem",
          DONE: "visited",
        },
        states: {
          focussed: {
            on: {
              INCREMENT: {
                actions: assign({
                  minutes: ({ minutes }) => {
                    return modMinutes(minutes + 1);
                  },
                }),
              },
              DECREMENT: {
                actions: assign({
                  minutes: ({ minutes }) => modMinutes(minutes - 1),
                }),
              },
              USER_INPUT: {
                actions: assign({
                  minutes: (_, { input }: { input: string }) => {
                    if (input === "0" || input === "") {
                      return "";
                    }
                    return modMinutes(Number(input));
                  },
                }),
              },
              TAB: {
                actions: send("MERIDIEM"),
              },
              BLUR: {
                actions: send("DONE"),
              },
            },
          },
        },
      },
      meridiem: {
        initial: "focussed",
        on: {
          DONE: "visited",
        },
        states: {
          focussed: {
            on: {
              TOGGLE: {
                actions: assign({
                  meridiem: ({ meridiem }) => {
                    if (meridiem === Meridiem.AM) {
                      return Meridiem.PM;
                    }
                    return Meridiem.AM;
                  },
                }),
              },
              USER_INPUT: {
                actions: assign({
                  meridiem: (_, { input }: { input: string }) => {
                    if (input.match(/[aA][mM]/)) {
                      return Meridiem.AM;
                    }
                    if (input.match(/[pP][mM]/)) {
                      return Meridiem.PM;
                    }

                    return input;
                  },
                }),
              },
              BLUR: {
                actions: [
                  assign((context: { meridiem: string }) => {
                    if (context.meridiem.match(/[aA][mM]?/)) {
                      return {
                        ...context,
                        meridiem: Meridiem.AM,
                      };
                    }
                    return {
                      ...context,
                      meridiem: Meridiem.PM,
                    };
                  }),
                  send("DONE"),
                ],
              },
            },
          },
        },
      },
    },
  },
  {
    guards: {
      isValid: ({ hours, minutes, meridiem }) => {
        return hours !== undefined && minutes !== undefined && meridiem;
      },
    },
  }
);

export default class HDateInput extends Component<HDateInputArgs> {
  @use statechart = useMachine(timeMachine)
    .withContext({
      hours: this.args.hours || 12,
      minutes: this.args.minutes || 0,
      meridiem: this.args.meridiem || Meridiem.PM,
    })
    .withConfig({
      actions: {
        onChange: this.onChange,
      },
    })
    .update(({ context, send }) => {
      console.log("CALLED UPDATE");
    });

  @matchesState("focussed") focussed!: boolean;

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
  onChange({ hours, minutes, meridiem }) {
    this.args.onChange(
      `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")} ${meridiem}`
    );
  }

  @action
  keyDown(event: KeyboardEvent) {
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
}
