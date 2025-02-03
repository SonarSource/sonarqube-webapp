/*
  Force the tailwind config from apps/sq-server,
  otherwise it isn't picked up by twin macro...
*/
const config = require('./config/tailwind/tailwind.config');

module.exports = {
  twin: {
    config,
    preset: 'emotion',
  },
};
