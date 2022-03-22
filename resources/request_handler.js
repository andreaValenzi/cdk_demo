const AWS = require('aws-sdk');

const region = process.env.REGION;
const account = process.env.ACCOUNT;

AWS.config.update({region});

const sqs = new AWS.SQS({apiVersion: '2012-11-05'});

exports.main = async function (event, context) {
    try {
        var method = event.httpMethod;

        if (method === 'POST') {
            if (event.path === '/') {
                const params = {
                   MessageBody: event.body,
                   QueueUrl: `https://sqs.${region}.amazonaws.com/${account}/demo`
                 };

                await sqs.sendMessage(params).promise();

                return {
                    statusCode: 200,
                    headers: {},
                    body: event.body
                };
            }
        };

        // We only accept POST for now
        return {
            statusCode: 400,
            headers: {},
            body: 'We only accept POST /'
        };
    } catch (error) {
        var body = error.stack || JSON.stringify(error, null, 2);
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify(body)
        };
    };
};