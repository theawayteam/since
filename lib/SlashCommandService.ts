import * as winston from 'winston';
import Item from '../model/Item';
import ItemService from './ItemService';
import MessageService from './MessageService';

export default class SlashCommandService {

  private static HELP_TEXT_OBJECT = {
    text: [
      '*Since Help* - Here are the actions you can take with Since',
      '',
      '- List current events: `/since list`',
      '- Create an event: `/since create <event name>`',
      '- Send feedback: `/since feedback`'
    ].join('\n')
  };

  // tslint:disable-next-line max-line-length
  private static FEEDBACK_TEXT = 'Thank you for sending us feedback! Please send an email to `support@theaway.team` and include your Slack Workspace name.';

  private itemService = new ItemService();
  private messageService = new MessageService();

  public async process(msg, bot) {
    try {
      const parts = msg.text.trim().split(' ');
      switch (parts[0]) {
        case 'list':
          winston.debug(`User ${msg.user_name} in team ${msg.team_id} ran a list command`);
          const items = await this.itemService.list(msg.team_id);
          const message = this.messageService.generateListMessage(items);
          return bot.replyPrivate(message);
        case 'create':
          winston.debug(`User ${msg.user_name} in team ${msg.team_id} ran a create command`);
          const name = parts.slice(1).join(' ');
          const item = new Item(msg.team_id, name, msg.user_name, new Date().getTime());
          this.itemService.save(item);
          await bot.say(this.messageService.generateCreateMessage(item));
          return bot.replyPrivate(`:heavy_check_mark: Event ${name} saved`);
        case 'feedback':
          winston.debug(`User ${msg.user_name} in team ${msg.team_id} ran a feedback command`);
          return bot.replyPrivate(SlashCommandService.FEEDBACK_TEXT);
        default:
          winston.debug(`User ${msg.user_name} in team ${msg.team_id} ran an other command`);
          return bot.replyPrivate(SlashCommandService.HELP_TEXT_OBJECT);
      }
    } catch (e) {
      winston.error('Error processing the slash command', e);
    }
  }

  public async processAction(msg, bot) {
    try {
      const team = msg.team.id;
      const action = msg.actions[0];
      const itemId = msg.callback_id;
      const item = await this.itemService.get(itemId, team);
      const lastTime = item.timestamp;
      switch (action.value) {
        case 'reset':
          winston.debug(`User ${msg.user.name} in team ${msg.team.id} reset an event`);
          item.timestamp = new Date().getTime();
          item.user = msg.user.id;
          await this.itemService.save(item);
          await bot.say(this.messageService.generateResetMessage(item, lastTime));
          break;
        case 'delete':
          winston.debug(`User ${msg.user.name} in team ${msg.team.id} deleted an event`);
          await this.itemService.delete(item.id, item.teamId);
          break;
      }
      const items = await this.itemService.list(team);
      const message = this.messageService.generateListMessage(items);
      message.replace_original = true;
      await bot.replyPrivate(message);
    } catch (e) {
      winston.error('Error processing a interactive action', e);
    }
  }
}
