const https = require('https');
import * as winston from 'winston';

export class NotificationService {
  private webhook: string;

  constructor() {
    this.webhook = process.env.WEBHOOK;
  }

  newCustomer() {
    this.send('New customer has installed Since!');
  }

  private send(text: string) {
    const data = JSON.stringify({ text });
    
    const options = {
      hostname: this.webhook,
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
    
    req.end();
  }
}