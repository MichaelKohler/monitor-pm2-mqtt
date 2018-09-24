'use strict';

const debug = require('debug')('mk:pm2mqtt:pm2');
const pm2 = require('pm2');

const config = require('../config.json');

const { topicRoot } = config.mqtt;

module.exports = {
  getProcessMessages,
};

function getProcessMessages() {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        return reject(new Error('COULD_NOT_CONNECT_PM2'));
      }

      pm2.list((err, processDescriptors) => {
        debug(`Got ${processDescriptors.length} processes!`);
        const processMessages = getProcessData(processDescriptors);
        resolve(processMessages);
      });
    });
  });
}

function getProcessData(descriptors) {
  const initialInfo = [{
    topic: `${topicRoot}total`,
    value: descriptors.length,
  }];

  return descriptors.reduce((info, descriptor) => {
    const processInfo = [{
      topic: `${topicRoot}${descriptor.name}/restarts`,
      value: descriptor.pm2_env.restart_time,
    }, {
      topic: `${topicRoot}${descriptor.name}/status`,
      value: getStatus(descriptor.pm2_env.status),
    }, {
      topic: `${topicRoot}${descriptor.name}/memory`,
      value: descriptor.monit.memory,
    }, {
      topic: `${topicRoot}${descriptor.name}/cpu`,
      value: descriptor.monit.cpu,
    }];

    return info.concat(processInfo);
  }, initialInfo);
}

function getStatus(status) {
  if (status === 'online') {
    return 1;
  }

  return 0;
}