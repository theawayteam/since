import * as winston from 'winston';
import Item from '../model/Item';
import ItemService from './ItemService';
import MessageService from './MessageService';
import TeamService from './TeamService';

export default class SlashCommandService {

  // tslint:disable-next-line max-line-length
  private static FEEDBACK_TEXT = 'Thank you for sending us feedback! Please send an email to `support@theaway.team` and include your Slack Workspace name.';
  private static FREE_TIER_MAXIMUM = parseInt(process.env.FREE_TIER_MAXIMUM, 10);
  // tslint:disable-next-line max-line-length
  private static FREE_TIER_TEXT = `:stop: You have reached the free tier limit of ${SlashCommandService.FREE_TIER_MAXIMUM} events. Please use \`/since payment\` to upgrade.`;

  private itemService = new ItemService();
  private teamService = new TeamService();
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
          const hasHitFreeTierLimit = await this.hasHitFreeTierLimit(msg.team_id);
          if (hasHitFreeTierLimit) {
            return bot.replyPrivate(SlashCommandService.FREE_TIER_TEXT);
          }
          const name = parts.slice(1).join(' ');
          const item = new Item(msg.team_id, name, msg.user_name, new Date().getTime());
          this.itemService.save(item);
          await bot.say(this.messageService.generateCreateMessage(item));
          return bot.replyPrivate(`:heavy_check_mark: Event ${name} saved`);
        case 'feedback':
          winston.debug(`User ${msg.user_name} in team ${msg.team_id} ran a feedback command`);
          return bot.replyPrivate(SlashCommandService.FEEDBACK_TEXT);
        case 'payment':
          winston.debug(`User ${msg.user_name} in team ${msg.team_id} ran a payment command`);
          // tslint:disable-next-line max-line-length
          return bot.replyPrivate(`Please go <${process.env.PAYMENT_DOMAIN}/payment?workspace=${msg.team_id}&productName=since|here> to submit payment`);
        default:
          const commands = [
            '*Since Help* - Here are the actions you can take with Since',
            '',
            '- List current events: `/since list`',
            '- Create an event: `/since create <event name>`',
            '- Send feedback: `/since feedback`'
          ];
          const team = await this.teamService.getTeam(msg.team_id);
          if (!team.paid) {
            commands.push('- Submit one-time payment: `/since payment`');
          }
          const helpTextObject = {
            text: commands.join('\n')
          };
          winston.debug(`User ${msg.user_name} in team ${msg.team_id} ran an other command`);
          return bot.replyPrivate(helpTextObject);
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

  private async hasHitFreeTierLimit(teamId: string) {
    const team = await this.teamService.getTeam(teamId);
    if (team.paid) {
      return false;
    }
    const items = await this.itemService.list(teamId);
    if (items.length >= SlashCommandService.FREE_TIER_MAXIMUM) {
      return true;
    }
    return false;
  }
}
