import https = require('https');
import * as winston from 'winston';

export class NotificationService {
  private webhook: string;

  constructor() {
    this.webhook = process.env.WEBHOOK;
  }

  newCustomer(payload) {
    const customer = JSON.parse(payload);
    const installTeam = customer.team.name 
    this.send(`New customer ${installTeam} has installed Since!`);
  }

  private send(text: string) {
    const data = JSON.stringify({
      'text': text
    });

    const options = {
      hostname: 'hooks.slack.com',
      path: this.webhook,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }

    const req = https.request(options, (res) => {
      winston.debug(`statusCode for sending webhook: ${res.statusCode}`);
    });

    req.on('error', (error) => {
      winston.error(`Error sending webhook ${error}`);
    })

    req.write(data);
    req.end();
  }
}
