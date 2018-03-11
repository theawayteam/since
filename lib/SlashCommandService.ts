export default class SlashCommandService {

  public async process(msg, bot) {
    const text = await this.getResponse(msg);
    bot.replyPrivate(text);
  }

  private async getResponse(msg): Promise<string> {
    return [
      'Since Help',
      ' - list: List current events'
    ].join('\n');
  }
}
