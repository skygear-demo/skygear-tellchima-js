'use strict';

const skygearCloud = require('skygear/cloud');

function generatePassword() {
  return Math.random().toString(36).substr(2);
}

function getContainer(userId) {
  const container = new skygearCloud.CloudCodeContainer();
  container.apiKey = skygearCloud.settings.masterKey;
  container.endPoint = skygearCloud.settings.skygearEndpoint + '/';
  container.asUserId = userId;
  return container;
}

function getDefaultUserID() {
  return '123';
}

function createUser(userName) {
  return getContainer().signupWithUsername(userName, generatePassword())
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

module.exports = {
  getContainer,
  createUser
};
