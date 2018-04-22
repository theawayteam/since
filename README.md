# Since

A bot for keeping track of how long since an event has occurred. A virtual "x days since last accident".

## Usage
Use the `/since` Slash Command to list and reset events.

## Development

```
npm install -g serverless
git clone https://github.com/theawayteam/since.git
cd since/
yarn
serverless deploy -s dev
```

### Setup
- Create a new Slack App
- Add the variables referenced in `serverless.yml` under `ssm:` to the EC2 parameter store
  - The Slack App API ID is the ID of your app found in the URL of you app (https://api.slack.com/apps/<api-id>)
- Deploy the Serverless stack
- Use the generated API Gateway URL to populate the Slash Command form
- Install the app in a testing account using the Manage Distribution Sharable URL (needed to trigger team persistence in DynamoDB)
- Enable Interactive Components with the same serverless URL

### Logging
Logs are pushed to LogDNA using the CloudWatch LogDNA integration. Logs are streamed from the CloudWatch stream to a LogDNA provided Lambda function and sent asynchronously so logging doesn't slow down core processing. The CloudWatch log filter used is `?debug ?info ?warn ?error`.
