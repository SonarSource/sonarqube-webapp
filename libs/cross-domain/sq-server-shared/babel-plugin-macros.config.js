/*
  twin.macro needs help finding the tailwind config
*/
const config = require('./config/tailwind/tailwind.config');

module.exports = {
  twin: {
    config,
    preset: 'emotion',
  },
};
