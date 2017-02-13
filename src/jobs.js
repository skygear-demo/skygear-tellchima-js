'use strict';
const date = require('./date');
const skygear = require('skygear');
const skygearCloud = require('skygear/cloud');

const { IncomingWebhook } = require('@slack/client');

const { getContainer,
        generateChimaSecret,
        generateChimaSalt } = require('./util');
const { botConfig } = require('./config');

/* Jobs */
function webhookOrNull(slackUrl) {
  if (slackUrl === undefined || slackUrl === null || slackUrl === '') {
    return null;
  }
  return new IncomingWebhook(slackUrl);
}

/**
 * Create a summary notification schedule interval.
 */
skygearCloud.every(botConfig.postSchedule, function () {
  if (botConfig.debugMode) {
    console.log('in summary schedule cronjob');
  }

  // Since this cloud code is triggered with cron job, we use
  // the default user as the user to make query and save records.
  let container = getContainer(botConfig.defaultUserId);
  var slackWebhookURL = botConfig.slackIncomingWebhook;

});

/**
 * Create a headsup notification schedule interval.
 */
//skygearCloud.every(botConfig.headsupSchedule, function () {
skygearCloud.every('*/5 * * * * *', function () { // testing mode
  if (botConfig.debugMode) {
    console.log('in headsup schedule cronjob');
  }
  var slackWebhookURL = botConfig.slackIncomingWebhook;
  let responseWebhook = webhookOrNull(slackWebhookURL);
  
  responseWebhook.send({text: 'If you have something to post, please `/tellchima`. Publish daily at 5pm.'});
});
