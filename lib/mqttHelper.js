'use strict';

const debug = require('debug')('mk:pm2mqtt:mqtt');
const MQTT = require('mqtt');
const config = require('../config.json');

const { host, username, password } = config.mqtt;
let mqttOptions = {};
let mqttReady = false;

if (username && password) {
  mqttOptions = {
    username,
    password,
  };
}

debug('Creating client for ..', host);
const client = MQTT.connect(host, mqttOptions);

client.on('connect', () => {
  debug('Connected to MQTT!');
  mqttReady = true;
});

client.on('error', (error) => {
  console.error(error);
});

module.exports = {
  publish,
};

function publish(topic, value) {
  if (!mqttReady) {
    return;
  }

  const stringifiedValue = `${value}`;

  debug('Publishing', topic, stringifiedValue);
  client.publish(topic, stringifiedValue);
}