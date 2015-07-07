var path = require("path");

var config = {
  context: __dirname,
  entry: ["./src/index"
  ],
  output: {
    filename: "client_bundle.js",
    path: "../app/assets/javascripts"
  }
};

module.exports = config;
