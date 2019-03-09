import { plainToClass } from 'class-transformer';
import * as crypto from 'crypto';
import * as uuid from 'uuid';
import * as winston from 'winston';

const ALGORITHM = 'aes-256-cbc';

export default class Item {

  public id = uuid.v4();

  constructor(public teamId: string, public name: string, public user: string, public timestamp: number) { }

  public encrypted(): Item {
    const cipher = crypto.createCipher(ALGORITHM, this.teamId);
    const clone = plainToClass(Item, JSON.parse(JSON.stringify(this)) as Item);
    try {
      const encryptedName = cipher.update(this.name, 'utf8', 'hex') + cipher.final('hex');
      clone.name = encryptedName;
    } catch (e) {
      winston.warn(`Unable to encrypt item ${this.id}`, e);
    }
    return clone;
  }

  public decrypted(): Item {
    const cipher = crypto.createDecipher(ALGORITHM, this.teamId);
    try {
      const decryptedName = cipher.update(this.name, 'hex', 'utf8') + cipher.final('utf8');
      this.name = decryptedName;
    } catch (e) {
      winston.warn(`Unable to decrypt item ${this.id}`, e);
    }
    return this;
  }
}
