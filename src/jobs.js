'use strict';
const date = require('./date');
const skygear = require('skygear');
const skygearCloud = require('skygear/cloud');

const { IncomingWebhook } = require('@slack/client');

const { getContainer,
        generateChimaSecret,
        generateChimaSalt } = require('./util');
const { botConfig } = require('./config');

/* Function Helpers */

function webhookOrNull(slackUrl) {
  if (slackUrl === undefined || slackUrl === null || slackUrl === '') {
    return null;
  }
  return new IncomingWebhook(slackUrl);
}

function postSummary() {
  let container = getContainer(botConfig.defaultUserId);
  var slackWebhookURL = botConfig.slackIncomingWebhook;

  var replyText = 'Chima Summary (`/tellchima` to add)';

  var now = new Date();
  var oneDayAgo = now.minus(24 * 60 * 60);

  const ChimaRecord = skygear.Record.extend('chima_record');
  const query = new skygear.Query(ChimaRecord);
  query.equalTo('removed', false);
  query.greaterThan('scheduledAt', oneDayAgo);
  query.addAscending('issueNo');
  query.overallCount = true;

  container.publicDB.query(query).then((records) => {
    var count = records.overallCount;
    console.log(records[0]);

    for (var i = 0; i < count; i++) {
      var record = records[i];
      replyText += '\n`#' + record.issueNo + '` ' + record.content;
    }

    if (count === 0) {
      replyText += '\n No News.';
    }

    let responseWebhook = webhookOrNull(slackWebhookURL);
    responseWebhook.send({text: replyText});
  }, (error) => {
    console.log(error);
  });

}

/* Jobs */

/**
 * Create a summary notification schedule interval.
 */
skygearCloud.every(botConfig.postSchedule, function () {
  if (botConfig.debugMode) {
    console.log('in summary schedule cronjob');
  }
  postSummary();
});

/**
 * Create a headsup notification schedule interval.
 */
skygearCloud.every(botConfig.headsupSchedule, function () {
  if (botConfig.debugMode) {
    console.log('in headsup schedule cronjob');
  }
  var slackWebhookURL = botConfig.slackIncomingWebhook;
  let responseWebhook = webhookOrNull(slackWebhookURL);
  responseWebhook.send({text: 'If you have something to post, please `/tellchima`. Publish daily at 5pm.'});
});
