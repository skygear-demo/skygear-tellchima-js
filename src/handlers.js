'use strict';

const skygear = require('skygear');
const skygearCloud = require('skygear/cloud');
//const _ = require('lodash');
const sha256 = require('sha256');
const { IncomingWebhook } = require('@slack/client');

const { getContainer,
        generateChimaSecret,
        generateChimaSalt } = require('./util');
const { botConfig } = require('./config');

/**
 * Returns a slack IncomingWebhook. Return null if the slack URL is not valid.
 */
function webhookOrNull(slackUrl) {
  if (slackUrl === undefined || slackUrl === null || slackUrl === '') {
    return null;
  }
  return new IncomingWebhook(slackUrl);
}

/**
 * Show help.
 */
function showHelp() {
  if (botConfig.debugMode) {
    console.log('in showHelp');
  }
  const commands = [
    '/tellchima - tell chima',
    '/untellchima - untell chima',
    '/schedulechima - schedule a chima post',
    '/tellskygear - tellchima skygear version',
    '/untellskygear - untell a skygear post'
  ];
  return {
    text: commands.join('\n')
  };
}

function cancelIssue(issueNo, proposedToken) {
  // TODO: Match Chima record

  var salt = 'Query from DB';
  var secret = 'Query from DB';

  // Check if possible to be deleted
  let proposedSecret = sha256(salt + proposedToken);
  if (proposedSecret === secret) {
    // TODO: Mark as deleted

    //set `removed` is true


    let responseWebhook = webhookOrNull(responseURL);
    responseWebhook.send({text: 'untellchima'});
  } else {
    // No, you can't remove this post.
    let responseWebhook = webhookOrNull(responseURL);
    responseWebhook.send({text: 'untellchima failed.'});
  }
}

function scheduleIssue(text, date) {

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
    salt: salt,
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
  // Parse format
  let str = text;
  var regexp = /(#[0-9]+) (\S+)/gi;

console.log(test)

  var matchesArray = regexp.exec(str);

  if (matchesArray && matchesArray.length > 0) {
    var issueNumber = matchesArray[1];
    var issueNo = parseInt(issueNumber.replace('#', ''));

    var proposedToken = matchesArray[2];
    cancelIssue(issueNo, proposedToken);

  } else {
    console.log('Error. Issue not specified');
  }
}

function listChima(responseURL) {
  var replyText = 'Chima Summary (`/tellchima` to add)';

  const ChimaRecord = skygear.Record.extend('chima_record');
  const query = new skygear.Query(ChimaRecord);
  query.greaterThan('_created_at', 10).notEqualTo('removed', true).addAscending('issueNo');

  skygear.publicDB.query(query).then((records) => {
    console.log(records[0]);
    let responseWebhook = webhookOrNull(responseURL);
    responseWebhook.send({text: replyText});
  }, (error) => {
    console.log(error);
    let responseWebhook = webhookOrNull(responseURL);
    responseWebhook.send({text: "error."});
  });
}

function handleCommand(command, text, responseURL) {
  if (botConfig.debugMode) {
    console.log('in handleCommand');
  }

  if (command === '/tellchima' || command === '/2tellchima') {
    tellChima(text, responseURL);
  } else if (command === '/untellchima' || command === '/2untellchima') {
    untellChima(text, responseURL);
  } else if (command === '/schedulechima' || command === '/2schedulechima') {
    console.log('schedulechima');
  } else if (command === '/tellskygear') {
    console.log('tellskygear');
  } else if (command === '/untellskygear') {
    console.log('untellskygear');
  } else if (command === '/listchima' || command === '/2listchima') {
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

