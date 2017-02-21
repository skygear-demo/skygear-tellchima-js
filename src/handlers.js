'use strict';
const date = require('./date');

const skygear = require('skygear');
const skygearCloud = require('skygear/cloud');
//const _ = require('lodash');
const sha256 = require('sha256');
const { IncomingWebhook } = require('@slack/client');

const { getContainer,
        generateChimaSecret,
        generateChimaSalt,
        webhookOrNull } = require('./util');
const { botConfig } = require('./config');

function cancelIssue(issueNo, proposedToken, responseURL) {
  const ChimaRecord = skygear.Record.extend('chima_record');
  const query = new skygear.Query(ChimaRecord);
  query.equalTo('issueNo', issueNo);

  let container = getContainer(botConfig.defaultUserId);
  container.publicDB.query(query).then((records) => {

    var record = records[0];
    console.log(record);

    var salt = record.salt;
    var secret = record.secret;

    // Check if possible to be deleted
    let proposedSecret = sha256(salt + proposedToken);


    if (botConfig.debugMode) {
      console.log('in cancelIssue');
      console.log('salt: ' + salt);
      console.log('secret: ' + secret);
      console.log('proposedSecret: ' + proposedSecret);
    }

    if (proposedSecret === secret) {
      // Mark as deleted
      record.removed = true;

      container.publicDB.save(record).then((result) => {
        let savedRecord = result;
        let responseWebhook = webhookOrNull(responseURL);

        console.log('Untell `' + record.issueNo + '` successfully');
        responseWebhook.send({text: 'untellchima successfully'});
      }, (error) => {
        console.error(error);
        console.log('Failed to untell chima.');
        responseWebhook.send({text: 'Failed to untell chima.'});
      });

    } else {
      // No, you can't remove this post.
      let responseWebhook = webhookOrNull(responseURL);
      console.log('untellchima failed.');
      responseWebhook.send({text: 'untellchima failed.'});
    }

  }, (error) => {
    console.log(error);
    let responseWebhook = webhookOrNull(responseURL);
    console.log('error');
    responseWebhook.send({text: 'error.'});
  });
}

function scheduleIssue(text, scheduledDate) {

}

function tellChima(text, responseURL) {
  // Create a new Chima record
  const ChimaRecord = skygear.Record.extend('chima_record');
  let responseWebhook = webhookOrNull(responseURL);

  let message = text;
  if (message.length === 0) {
    responseWebhook.send({
      text: 'There\'s no message text in your last command. \
      You can tell chima like this: `/tellchima <YOUR MESSAGE>`'});
    return;
  }

  let token = generateChimaSecret();
  let salt = generateChimaSalt();

  let container = getContainer(botConfig.defaultUserId);
  var issueNo = new skygear.Sequence();
  var record = new ChimaRecord({
    content: text,
    issueNo: issueNo,
    removed: false,
    salt: salt,
    scheduledAt: new Date(),
    secret: sha256(salt + token)
  });

  container.publicDB.save(record).then((result) => {
    let savedRecord = result;

    var replyText = 'Received!\nPreview: `#' +
         savedRecord.issueNo + '` ' +
        savedRecord.content +
        '\n P.S. You can remove this post with `/untellchima #' +
        savedRecord.issueNo + ' ' + token + '`';
    responseWebhook.send({text: replyText});
  }, (error) => {
    console.error(error);
    responseWebhook.send({text: 'Failed to tell chima.'});
  });
}

function untellChima(text, responseURL) {
  if (botConfig.debugMode) {
    console.log('in untellChima');
  }
  // Parse format
  let str = text;
  var regexp = /(#[0-9]+) (\S+)/gi;

  var matchesArray = regexp.exec(str);

  if (matchesArray && matchesArray.length > 0) {
    var issueNumber = matchesArray[1];
    var issueNo = parseInt(issueNumber.replace('#', ''));

    var proposedToken = matchesArray[2];

    console.log('issue:' + issueNo);
    console.log('proposedToken:' + proposedToken);

    cancelIssue(issueNo, proposedToken, responseURL);

  } else {
    let responseWebhook = webhookOrNull(responseURL);
    responseWebhook.send({text: 'Ooops. Issue not specified.'});
    console.log('Error. Issue not specified');
  }
}

function scheduleChima(text, responseURL) {
  // Parse the date

  // call scheduleIssue
}

function listChima(responseURL) {
  if (botConfig.debugMode) {
    console.log('in listChima');
  }
  var replyText = 'Chima Summary (`/tellchima` to add)';
  var now = new Date();
  var oneDayAgo = now.minus(24 * 60 * 60);

  const ChimaRecord = skygear.Record.extend('chima_record');
  const query = new skygear.Query(ChimaRecord);
  query.equalTo('removed', false);
  query.greaterThan('scheduledAt', oneDayAgo);
  query.addAscending('issueNo');
  query.overallCount = true;

  let container = getContainer(botConfig.defaultUserId);

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

    let responseWebhook = webhookOrNull(responseURL);
    responseWebhook.send({text: replyText});
  }, (error) => {
    console.log(error);
    let responseWebhook = webhookOrNull(responseURL);
    responseWebhook.send({text: 'error.'});
  });
}

function handleCommand(command, text, responseURL) {
  if (botConfig.debugMode) {
    console.log('in handleCommand');
  }

  if (command === '/tellchima') {
    tellChima(text, responseURL);
  } else if (command === '/untellchima') {
    untellChima(text, responseURL);
  } else if (command === '/schedulechima') {
    console.log('schedulechima');
  } else if (command === '/tellskygear') {
    console.log('tellskygear');
  } else if (command === '/untellskygear') {
    console.log('untellskygear');
  } else if (command === '/listchima') {
    console.log('listchima');
    listChima(responseURL);
  } else {
    console.log('No such command');
    return {text: 'No such command'};
  }

  return {text: 'Not yet implemented'};
}

function slashCommandPromise(req) {
  return new Promise((resolve, reject) => {
    req.form(function (formError, fields) {
      if (formError !== undefined && formError !== null) {
        reject({error: formError});
        return;
      }

      if (!('command' in fields) ||
        !('token' in fields) ||
        !('text' in fields) ||
        !('response_url' in fields)
        ) {
        reject({error: 'missing some fields'});
        return;
      }

      if (botConfig.debugMode) {
        // console.log('Received slash command with fields', fields);
        console.log(fields.command);
        console.log(fields.text);
        console.log(fields.response_url);
      }

      // if (fields.token !== botConfig.slackSlashCommandToken) {
      //   console.error('slash command token does not match expected value');
      //   reject({error: 'token does not match'});
      //   return;
      // }

      resolve({text: 'Meow! Processing...'});
      return handleCommand(
        fields.command,
        fields.text,
        fields.response_url);
    });
  });
}

skygearCloud.handler('/slash-command', function (req) {
  if (botConfig.debugMode) {
    console.log('in slash-command handler');
  }
  return slashCommandPromise(req);
}, {
  method: ['POST']
});

