'use strict';
const date = require('./date');
const skygear = require('skygear');
const skygearCloud = require('skygear/cloud');
const request = require('request');

const { getContainer,
        generateChimaSecret,
        generateChimaSalt,
        webhookOrNull } = require('./util');
const { botConfig } = require('./config');

/* Function Helpers */
function postSummary() {
  let container = getContainer(botConfig.defaultUserId);
  var slackWebhookURL = botConfig.slackIncomingWebhook;

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

    var replyText = 'Chima Summary (`/tellchima` to add)';
    if (count === 0) {
      // Show a HN Story
      var hnURL = "https://news.ycombinator.com/item?id=";
      var hnAPI = "https://hacker-news.firebaseio.com/v0/topstories.json";

      request({url: hnAPI}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var stories = JSON.parse(body);
          var topStory = stories[0];
          var emptyText = '\n No News. But here\'s the top HN story: ' + hnURL + topStory;
          responseWebhook.send({text: emptyText});
        }
      });
    }

    let responseWebhook = webhookOrNull(slackWebhookURL);
    responseWebhook.send({text: replyText});

    for (var i = 0; i < count; i++) {
      var record = records[i];
      replyText = '\n`#' + record.issueNo + '` ' + record.content;
      setTimeout(function (replyText) {
        responseWebhook.send(replyText)
      }, 1000 * (i + 1), replyText)
    }
    
  }, (error) => {
    console.log(error);
  });
}

function post9up() {
  let container = getContainer(botConfig.defaultUserId);
  var slack9upWebhookURL = botConfig.slack9upWebhook;
  const cantoneseBotURL = 'https://cantonese-chatbot.pandawork.com/';

  if (!slack9upWebhookURL) {
    return;
  }

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

    var replyText = '*9up by 9up Chima*';
    if (count === 0) {
      var emptyText = 'No one tell chima today.';
      responseWebhook.send({text: emptyText});
    }

    let responseWebhook = webhookOrNull(slack9upWebhookURL);
    responseWebhook.send({text: replyText});

    const promises = [];

    // Prepare 9up replies
    for (var i = 0; i < count; i++) { 
      let task = new Promise(resolve => {

        let record = records[i];

        let requestBody = `{"message": "${record.content}"}`
        var options = { method: 'POST',
          url: cantoneseBotURL,
          headers: { 'Cache-Control': 'no-cache' },
          body: requestBody };

        request(options, function (error, response, body) {
          if (error) throw new Error(error);

          let responseBody = JSON.parse(response.body);
          let reply = responseBody.reply;
          let re = /@(\w+)\/(\w+)/gi; // Translate Telegram style icon to Slack style icon
          let newReply = reply.replace(re, ':lihkg_$1_$2:');

          record.botReply = newReply;
          resolve(reply);
        });
      })

      promises.push(task);
    }

    // Wait till all promises, send summary
    Promise.all(promises)
      .then(data => {
        for (let i = 0; i < count; i++) {
          let record = records[i];
          replyText = '\n`#' + record.issueNo + '` ' + record.content + '\n>:moonchima: ' + record.botReply;
          setTimeout(function (replyText) {
            responseWebhook.send(replyText)
          }, 1000 * (i + 1), replyText)
        }
      });
    
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
  post9up()
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
