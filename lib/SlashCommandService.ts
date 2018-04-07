import * as moment from 'moment';
import Item from '../model/Item';
import ItemService from './ItemService';

export default class SlashCommandService {

  private static HELP_TEXT_OBJECT = {
    attachments: [{
      text: [
        'List current events',
        '`/since list`',
        'Reset the time on an event',
        '`/since reset <event name>`'
      ].join('\n')
    }],
    text: 'Since Help'
  };

  private itemService = new ItemService();

  public async process(msg, bot) {
    const parts = msg.text.trim().split(' ');
    switch (parts[0]) {
      case 'list':
        const items = await this.itemService.list(msg.team_id);
        const message = 'Events:\n' + items.sort((i1, i2) => {
          return i2.timestamp - i1.timestamp;
        }).map((item) => {
          const timeSince = new Date().getTime() - item.timestamp;
          return `${item.name} - ${moment.duration(timeSince, 'millisecond').humanize()} ago`;
        }).join('\n');
        return bot.replyPrivate(message);
      case 'reset':
        const name = parts.slice(1).join(' ');
        let resetItem = await this.itemService.get(name, msg.team_id);
        if (!resetItem) {
          resetItem = new Item(msg.team_id, name, new Date().getTime());
        } else {
          resetItem.timestamp = new Date().getTime();
        }
        this.itemService.save(resetItem);
        return bot.replyPrivate(`Event ${name} saved`);
      default:
        return bot.replyPrivate(SlashCommandService.HELP_TEXT_OBJECT);
    }
  }
}
