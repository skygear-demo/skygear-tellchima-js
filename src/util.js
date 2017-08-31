'use strict';

const { IncomingWebhook } = require('@slack/client');
const skygearCloud = require('skygear/cloud');

function generateUserPassword() {
  return Math.random().toString(36).substr(2);
}

function generateChimaSecret() {
  var len = 8,
    str = '';
  for (var i = 0; i < len; i++) {
    str += String.fromCharCode(65 + ~~(Math.random() * 25));
  }
  return str;
}

function generateChimaSalt() {
  var len = 8,
    str = '';
  for (var i = 0; i < len; i++) {
    str += String.fromCharCode(65 + ~~(Math.random() * 25));
  }
  return str;
}

function getContainer(userId) {
  const container = new skygearCloud.CloudCodeContainer();
  container.apiKey = skygearCloud.settings.masterKey;
  container.endPoint = skygearCloud.settings.skygearEndpoint + '/';
  container.asUserId = userId;
  return container;
}

function createUser(userName) {
  return getContainer().auth.signupWithUsername(userName, generateUserPassword())
    .then((user) => {
      console.info(`Created user "${user.id}" for "${userName}".`);
      return {
        id: user.id,
        userName: userName
      };
    }, (err) => {
      console.error(`Unable to create user for "${userName}"`, err);
      return err;
    });
}

/**
 * Returns a slack IncomingWebhook. Return null if the slack URL is not valid.
 */
function webhookOrNull(slackUrl) {
  if (slackUrl === undefined || slackUrl === null || slackUrl === '') {
    return null;
  }
  return new IncomingWebhook(slackUrl);
}


module.exports = {
  getContainer,
  generateChimaSecret,
  generateChimaSalt,
  webhookOrNull
};
