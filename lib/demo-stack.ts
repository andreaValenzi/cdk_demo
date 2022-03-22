import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class DemoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'DemoQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const demo_queue = new sqs.Queue(this, 'demo_queue', {
      queueName: 'demo',
      retentionPeriod: Duration.days(14),
      visibilityTimeout: Duration.seconds(30),
    });

    const message_handler = new lambda.Function(this, 'demo_message_handler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('resources'),
      handler: 'message_handler.main',
      functionName: 'message_handler',
      timeout: Duration.seconds(30),
    });

    message_handler.addEventSource(
      new SqsEventSource(demo_queue, {
        batchSize: 1,
      })
    );

    const request_handler = new lambda.Function(this, 'demo_request_handler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('resources'),
      handler: 'request_handler.main',
      functionName: 'request_handler',
      timeout: Duration.seconds(30),
      environment: {
        ACCOUNT: process.env.AWS_ACCOUNT || '',
        REGION: process.env.AWS_REGION || '',
      }
    });

    demo_queue.grantSendMessages(request_handler);

    const api = new apigateway.RestApi(this, 'demo-api', {
      restApiName: 'Demo Service',
      description: 'This service handles a queue.',
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL]
      },
    });

    const demo_integration = new apigateway.LambdaIntegration(request_handler, {
      requestTemplates: { 'application/json': '{ "statusCode": "200" }' }
    });

    api.root.addMethod('POST', demo_integration); // POST /
  }
}
