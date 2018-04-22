import * as uuid from 'uuid';

export default class Item {

  public id = uuid.v4();

  constructor(public teamId: string, public name: string, public user: string, public timestamp: number) { }
}
