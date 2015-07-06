var path = require("path");

var config = {
  context: __dirname,
  entry: ["./src/map"
  ],
  output: {
    filename: "map.js",
    path: "../app/assets/javascripts"
  }
};

module.exports = config;
