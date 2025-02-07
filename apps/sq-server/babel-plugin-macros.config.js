/*
  twin.macro needs help finding the tailwind config
*/
const config = require('../../libs/cross-domain/sq-server-shared/config/tailwind/tailwind.config');

module.exports = {
  twin: {
    config,
    preset: 'emotion',
  },
};
