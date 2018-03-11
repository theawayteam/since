import * as moment from 'moment';
import Item from '../model/Item';
import ItemService from './ItemService';

export default class SlashCommandService {

  private static HELP_TEXT = [
    'Since Help',
    ' - list: List current events',
    ' - reset <event name>: Reset the time on an event'
  ].join('\n');

  private itemService = new ItemService();

  public async process(msg, bot) {
    if (!msg.text.trim()) {
      return bot.replyPrivate(SlashCommandService.HELP_TEXT);
    }
    const parts = msg.text.trim().split(' ');
    const command = parts[0];
    if (command === 'list') {
      const items = await this.itemService.list(msg.team_id);
      const message = 'Events:\n' + items.sort((i1, i2) => {
        return i2.timestamp - i1.timestamp;
      }).map((item) => {
        return `${item.name} - ${moment.duration(new Date().getTime() - item.timestamp, 'millisecond').humanize()} ago`;
      }).join('\n');
      bot.replyPrivate(message);
    } else if (command === 'reset') {
      const name = parts.slice(1).join(' ');
      let item = await this.itemService.get(name, msg.team_id);
      if (!item) {
        item = new Item(msg.team_id, name, new Date().getTime());
      } else {
        item.timestamp = new Date().getTime();
      }
      this.itemService.save(item);
      bot.replyPrivate(`Event ${name} saved`);
    }
  }
}
