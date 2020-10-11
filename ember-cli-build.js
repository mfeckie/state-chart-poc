"use strict";

const EmberApp = require("ember-cli/lib/broccoli/ember-app");
const env = EmberApp.env();

module.exports = function (defaults) {
  let app = new EmberApp(defaults, {
    postcssOptions: {
      compile: {
        plugins: [require("tailwindcss")],
      },
    },
    fingerprint: {
      enabled: env === "production",
      prepend: "https://mfeckie.github.io/state-chart-poc",
    },
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  return app.toTree();
};
