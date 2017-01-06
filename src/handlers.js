'use strict';

const skygear = require('skygear');
const skygearCloud = require('skygear/cloud');
const _ = require('lodash');
const { IncomingWebhook } = require('@slack/client');

const { getContainer } = require('./util');
const { botConfig } = require('./config');

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
    '/untellchima',
    '/schedulechima',
    '/tellskygear',
    '/untellskygear'
  ];
  return {
    text: commands.join('\n')
  };
}


function handleCommand(command, text, responseURL) {
  return {text: text};
  //return {text: text};

}

function slashCommandPromise(req) {
  return new Promise((resolve, reject) => {
    req.form(function (formError, fields) {
      if (formError !== undefined && formError !== null) {
        reject({error: formError});
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

      resolve({text: 'loading'});
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
});
