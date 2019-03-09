import { DynamoDB } from 'aws-sdk';
import { plainToClass } from 'class-transformer';
import Item from '../model/Item';

export default class ItemService {

  private client = new DynamoDB.DocumentClient();

  public async save(item: Item) {
    return this.client.put({
      Item: item,
      TableName: process.env.ITEM_TABLE_NAME
    }).promise();
  }

  public async get(id: string, teamId: string): Promise<Item> {
    const response = await this.client.get({
      Key: {
        id,
        teamId
      },
      TableName: process.env.ITEM_TABLE_NAME
    }).promise();
    return plainToClass(Item, response.Item);
  }

  public async delete(id: string, teamId: string): Promise<void> {
    await this.client.delete({
      Key: {
        id,
        teamId
      },
      TableName: process.env.ITEM_TABLE_NAME
    }).promise();
  }

  public async list(teamId: string): Promise<Item[]> {
    const response = await this.client.query({
      ExpressionAttributeValues: {
        ':teamId': teamId
      },
      KeyConditionExpression: 'teamId = :teamId',
      TableName: process.env.ITEM_TABLE_NAME
    }).promise();
    return response.Items.map((item) => {
      return plainToClass(Item, item);
    });
  }
}
