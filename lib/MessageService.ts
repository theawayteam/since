import * as moment from 'moment';
import Item from '../model/Item';

export default class MessageService {

  public generateListMessage(items: Item[]): any {
    return {
      attachments: items.sort((i1, i2) => {
        return i2.timestamp - i1.timestamp;
      }).map((item) => {
        return this.generateListItem(item);
      }),
      text: 'Events:'
    };
  }

  private generateListItem(item: Item): any {
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
  }
}
