'use strict';

const skygear = require('skygear');
const skygearCloud = require('skygear/cloud');
const _ = require('lodash');
const { IncomingWebhook } = require('@slack/client');

const { getContainer } = require('./util');
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


function handleCommand(command, text, responseURL) {
  if (botConfig.debugMode) {
    console.log('in handleCommand');
  }

  if (command === '/tellchima') {

  } else if (command === '/untellchima'){

  } else if (command === '/2tellchima'){
    responseWebhook.send({text: 'tellchima'});
  } else if (command === '/schedulechima'){

  } else if (command === '/tellskygear'){

  } else if (command === '/untellskygear'){

  } else if (command === '/listchima'){

  } else {
    console.log('No such command');
    return {text: 'No such command'};
  }

  let responseWebhook = webhookOrNull(responseURL);
  responseWebhook.send({text: 'zZZz'});
  return {text: text};
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

      if (fields.token !== botConfig.slackSlashCommandToken) {
        console.error('slash command token does not match expected value');
        reject({error: 'token does not match'});
        return;
      }

      resolve({text: ''});
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
