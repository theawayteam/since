import 'reflect-metadata';

import * as slack from 'serverless-slack';
import SlashCommandService from './lib/SlashCommandService';

const logdna = require('logdna-winston');
import * as winston from 'winston';

winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {
  level: 'debug',
  prettyPrint: true,
  timestamp: true
});

if (process.env.LOGDNA_KEY) {
  winston.add((winston.transports as any).Logdna, {
    app: 'since',
    env: process.env.STAGE,
    handleExceptions: true,
    index_meta: true,
    key: process.env.LOGDNA_KEY,
    level: 'debug'
  });
}

exports.handler = slack.handler.bind(slack);

const slashCommandService = new SlashCommandService();

slack.on('slash_command', async (msg, bot) => {
  await slashCommandService.process(msg, bot);
});

slack.on('interactive_message', async (msg, bot) => {
  await slashCommandService.processAction(msg, bot);
});
