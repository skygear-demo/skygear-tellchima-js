'use strict';

const botConfig = {
  slackSlashCommandToken: process.env.SLACK_SLASH_COMMAND_TOKEN,
  slackIncomingWebhook: process.env.SLACK_INCOMING_WEBHOOK,
  debugMode: process.env.DEBUG_MODE === 'true',
  appName: process.env.APP_NAME || '_',
  channelOverride: process.env.CHANNEL_OVERRIDE || '',
  defaultUser: process.env.DEFAULT_USER || 'admin',
  postSchedule: process.env.POST_SCHEDULE || '0 0 12 * * 1,2,3,4,5',
  notifySchedule: process.env.NOTIFY_SCHEDULE || '0 0 12 * * 1,2,3,4,5'
};

module.exports = {
  botConfig
};
