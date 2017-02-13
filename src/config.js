'use strict';

const botConfig = {
  slackSlashCommandToken: process.env.SLACK_SLASH_COMMAND_TOKEN,
  slackIncomingWebhook: process.env.SLACK_INCOMING_WEBHOOK,
  debugMode: process.env.DEBUG_MODE === 'true',
  appName: process.env.APP_NAME || '_',
  channelOverride: process.env.CHANNEL_OVERRIDE || '',
  defaultUserId: process.env.DEFAULT_USER_ID || 'admin',
  postSchedule: process.env.POST_SCHEDULE || '0 16 * * * *',
  headsupSchedule: process.env.NOTIFY_SCHEDULE || '0 17 * * * *'
};

module.exports = {
  botConfig
};
