'use strict';

const debug = require('debug')('mk:pm2mqtt:index');
const mqttHelper = require('./lib/mqttHelper');
const pm2Helper = require('./lib/pm2Helper');

let config;

try {
  config = require('./config.json');
} catch(err) {
  console.error(err);
  process.exit(1);
}

setInterval(() => {
  updateValues();
}, config.intervalInMS);

updateValues();

function updateValues() {
  debug('Starting to get new values..');

  pm2Helper.getProcessMessages()
    .then((messages) => {
      messages.map((message) => {
        mqttHelper.publish(message.topic, message.value);
      });
    });
}
