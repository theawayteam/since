import { DynamoDB } from 'aws-sdk';
import { plainToClass } from 'class-transformer';
import Team from '../model/Team';

export default class MessageService {

  private client = new DynamoDB.DocumentClient();

  public async getTeam(id: string): Promise<Team> {
    const response = await this.client.get({
      Key: {
        id
      },
      TableName: process.env.TABLE_NAME
    }).promise();
    return plainToClass(Team, response.Item);
  }
}
