import { Machine, assign, send, StateSchema } from "xstate";

export enum Meridiem {
  AM = "AM",
  PM = "PM",
}

interface TimeStateSchema extends StateSchema {
  states: {
    idle: StateSchema;
    focussed: StateSchema;
    visited: StateSchema;
    valid: StateSchema;
    invalid: StateSchema;
    hours: {
      states: {
        focussed: StateSchema;
      };
    };
    minutes: {
      states: {
        focussed: StateSchema;
      };
    };
    meridiem: {
      states: {
        focussed: StateSchema;
      };
    };
    dropdown: {
      states: {
        hours: StateSchema;
        minutes: StateSchema;
        meridiem: StateSchema;
      };
    };
  };
}

export type Events =
  | { type: "BLUR" }
  | { type: "FOCUS" }
  | { type: "TAB" }
  | { type: "HOURS" }
  | { type: "MINUTES" }
  | { type: "USER_INPUT"; input: string }
  | { type: "MERIDIEM" }
  | { type: "DONE" }
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "TOGGLE" }
  | { type: "VALIDATE" }
  | { type: "DROPDOWN" }
  | { type: "SELECT"; input: string }
  | { type: "SELECT_MERIDIEM"; input: Meridiem }
  | { type: "TOGGLE_DROPDOWN" };

export interface TimeContext {
  hours: number | "";
  minutes: number | "";
  meridiem: Meridiem | string;
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

export const TimeMachine = Machine<TimeContext, TimeStateSchema, Events>(
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
          TOGGLE_DROPDOWN: "dropdown",
        },
      },
      focussed: {
        entry: [
          assign((context: TimeContext) => {
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
          TOGGLE_DROPDOWN: "dropdown",
        },
      },
      dropdown: {
        initial: "hours",
        on: {
          MINUTES: "minutes",
          DONE: "visited",
          TOGGLE_DROPDOWN: "visited",
        },
        states: {
          hours: {
            on: {
              SELECT: {
                actions: [
                  assign({
                    hours: (_, { input }) => Number(input),
                  }),
                ],
                target: "minutes",
              },
            },
          },
          minutes: {
            on: {
              SELECT: {
                actions: [
                  assign({
                    minutes: (_, { input }) => Number(input),
                  }),
                ],
                target: "meridiem",
              },
            },
          },
          meridiem: {
            on: {
              SELECT_MERIDIEM: {
                actions: [
                  assign({
                    meridiem: (_, { input }) => input,
                  }),
                  send("DONE"),
                ],
              },
            },
          },
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
          TOGGLE_DROPDOWN: "dropdown",
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
                  hours: ({ hours }) => modHours((hours as number) + 1),
                }),
              },
              DECREMENT: {
                actions: assign({
                  hours: ({ hours }) => modHours((hours as number) - 1),
                }),
              },
              USER_INPUT: {
                actions: assign({
                  hours: (_context, { input }) => {
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
                    return modMinutes((minutes as number) + 1);
                  },
                }),
              },
              DECREMENT: {
                actions: assign({
                  minutes: ({ minutes }) => modMinutes((minutes as number) - 1),
                }),
              },
              USER_INPUT: {
                actions: assign({
                  minutes: (_, { input }) => {
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
                  meridiem: (_, { input }) => {
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
        return (
          hours !== undefined && minutes !== undefined && meridiem !== undefined
        );
      },
    },
  }
);
