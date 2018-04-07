import * as moment from 'moment';
import * as winston from 'winston';
import Item from '../model/Item';
import ItemService from './ItemService';

export default class SlashCommandService {

  private static HELP_TEXT_OBJECT = {
    attachments: [{
      text: [
        'List current events',
        '`/since list`',
        'Create an event',
        '`/since create <event name>`'
      ].join('\n')
    }],
    text: 'Since Help'
  };

  private itemService = new ItemService();

  public async process(msg, bot) {
    try {
      const parts = msg.text.trim().split(' ');
      switch (parts[0]) {
        case 'list':
          const items = await this.itemService.list(msg.team_id);
          const message = this.message(items);
          return bot.replyPrivate(message);
        case 'create':
          const name = parts.slice(1).join(' ');
          const item = new Item(msg.team_id, name, msg.user_name, new Date().getTime());
          this.itemService.save(item);
          return bot.replyPrivate(`:heavy_check_mark: Event ${name} saved`);
        default:
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
      switch (action.value) {
        case 'reset':
          item.timestamp = new Date().getTime();
          item.user = msg.user.name;
          await this.itemService.save(item);
          break;
        case 'delete':
          await this.itemService.delete(item.id, item.teamId);
          break;
      }
      const items = await this.itemService.list(team);
      const message = this.message(items);
      message.replace_original = true;
      await bot.replyPrivate(message);
    } catch (e) {
      winston.error('Error processing a interactive action', e);
    }
  }

  private message(items: Item[]): any {
    return {
      attachments: items.sort((i1, i2) => {
        return i2.timestamp - i1.timestamp;
      }).map((item) => {
        const timeSince = new Date().getTime() - item.timestamp;
        return {
          actions: [{
            name: 'action',
            text: 'Reset',
            type: 'button',
            value: 'reset'
          }, {
            confirm: {
              dismiss_text: 'No',
              ok_text: 'Yes',
              title: 'Are you sure?'
            },
            name: 'action',
            style: 'danger',
            text: 'Delete',
            type: 'button',
            value: 'delete'
          }],
          callback_id: item.id,
          text: `${item.name} - ${moment.duration(timeSince, 'millisecond').humanize()} ago by ${item.user}`
        };
      }),
        text: 'Events:'
    };
  }
}
