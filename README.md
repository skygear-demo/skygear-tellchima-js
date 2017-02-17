# Tellchima - Skygear JS Cloud Code Demo

![Tellchima](images/tellchima-icon.jpg)

This bot lets you to send a message to the team with `/tellchima` command. The aggregated summary will be posted back to the slack channel each day at 5pm.

## Demonstrated Features

This is a Skygear JS Cloud Code demo of the following cloud code features:

* Scheduled Tasks (remind the team to post at 4pm, send a summary at 5pm)
* Calling Skygear API (saving and querying the message records)
* Handler (implement Slack webhook request)
* 

## Requirements

* Skygear (sign up an account at [Skygear.io](https://portal.skygear.io/))
* Slack Incoming Webhook
* Slack Slash Command

## Setup

1. Clone this repository
2. Create a Skygear account at [skygear.io](https://portal.skygear.io)
3. Push the repository to Skygear Cloud (see [doc](https://docs.skygear.io/) for details)
4. Create Slack Incoming Webhook and Slack Slash Command
5. Configure the bot using environment variables

## Configuration

The bot can be configured with the following environment variables (in settings in the portal):

* `SLACK_SLASH_COMMAND_TOKEN` - The token is provided by slack to verify
  that the slash command really comes from slack.
* `SLACK_INCOMING_WEBHOOK` - The incoming webhook is how the bot
  can send a message to a slack channel. Also provided by slack.
* `DEBUG_MODE` - Print additional log when value is `true`.
* `APP_NAME` - The app name, default: `'_'`
* `CHANNEL_OVERRIDE` - Always send message to this channel, default the original incoming channel.
* `DEFAULT_USER_ID` - The username that the bot will use to access Skygear. Default: `'admin'`
* `POST_SCHEDULE` - The schedule for sending the reminder. Please
  see the doc for scheduled task format. Default: `'0 0 16 * * *'`
* `NOTIFY_SCHEDULE` - The schedule for sending the summary. Default: `'0 0 17 * * *'`

## Usage

* `/tellchima` - Send a message to the team.
* `/untellchima` - Remove the specified message. It validates a generated secret given during `/tellchima`
* `/schedulechima` - Schedule a message on a date format: `yyyymmdd`

## Notes
Chima the cat, is the CEO at Oursky. You can learn more about him on this [Facebook Page](https://www.facebook.com/chima.fasang/).
