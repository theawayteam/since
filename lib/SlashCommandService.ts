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
          const message = 'Events:\n' + items.sort((i1, i2) => {
            return i2.timestamp - i1.timestamp;
          }).map((item) => {
            const timeSince = new Date().getTime() - item.timestamp;
            return `${item.name} - ${moment.duration(timeSince, 'millisecond').humanize()} ago by ${item.user}`;
          }).join('\n');
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
      winston.error('Error processing a slash command', e);
    }
  }
}
