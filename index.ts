import 'reflect-metadata';

import * as slack from 'serverless-slack';
import SlashCommandService from './lib/SlashCommandService';
import { NotificationService } from './lib/NotificationService';

import * as winston from 'winston';

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  level: 'debug',
  prettyPrint: true,
  timestamp: true
});

exports.handler = slack.handler.bind(slack);

const slashCommandService = new SlashCommandService();
const notificationService = new NotificationService();

slack.on('slash_command', async (msg, bot) => {
  await slashCommandService.process(msg, bot);
});

slack.on('interactive_message', async (msg, bot) => {
  await slashCommandService.processAction(msg, bot);
});

slack.on('install_success', (payload) => {
  notificationService.newCustomer(payload);
});
slack.on('install_error', (error,payload) => {
  winston.debug(`install_error '${JSON.stringify(error)}' payload was '${JSON.stringify(payload)}'`);
  //notificationService.newCustomerError(error,payload);
});