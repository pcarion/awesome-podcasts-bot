import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

import { ApplicationFunction, WebhookEvents } from '../types';

import { Probot } from 'probot';

import getPrivateKey from './getPrivateKey';

import template from './probotview';

let probot: Probot | undefined;

const loadProbot = (appFn: ApplicationFunction) => {
  probot =
    probot ||
    new Probot({
      appId: process.env.APP_ID,
      secret: process.env.WEBHOOK_SECRET,
      privateKey: getPrivateKey({
        privateKey: process.env.PRIVATE_KEY,
        privateKeyPath: process.env.PRIVATE_KEY_PATH,
      }),
    });

  probot.load(appFn);

  return probot;
};

type HeaderArg = Record<string, string | undefined>;
const lowerCaseKeys = (obj: HeaderArg = {}): HeaderArg =>
  Object.keys(obj).reduce(
    (accumulator, key) => Object.assign(accumulator, { [key.toLocaleLowerCase()]: obj[key] }),
    {},
  );

export default function mkServerlessHandler(appFn: ApplicationFunction) {
  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    // 🤖 A friendly homepage if there isn't a payload
    if (event.httpMethod === 'GET' && event.path === '/probot') {
      const res = {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/html',
        },
        body: template,
      };
      return res;
    }

    // Otherwise let's listen handle the payload
    probot = probot || loadProbot(appFn);

    // Ends function immediately after callback
    context.callbackWaitsForEmptyEventLoop = false;

    // Determine incoming webhook event type
    const headers = lowerCaseKeys(event.headers);
    const e = headers['x-github-event'];
    if (!e) {
      return {
        statusCode: 400,
        body: 'X-Github-Event header is missing',
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        body: 'missing body',
      };
    }

    // If body is expected to be base64 encoded, decode it and continue
    const eventBody = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;

    // Convert the payload to an Object if API Gateway stringifies it
    const jsonBody = typeof eventBody === 'string' ? JSON.parse(eventBody) : eventBody;

    // Bail for null body
    if (!jsonBody) {
      return {
        statusCode: 400,
        body: 'Event body is null.',
      };
    }

    // Do the thing
    console.log(`Received event ${e}${jsonBody.action ? '.' + jsonBody.action : ''}`);
    if (event) {
      try {
        await probot.receive({
          id: 'toto',
          name: e as WebhookEvents,
          payload: jsonBody,
        });
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: `Received ${e}.${jsonBody.action}`,
          }),
        };
      } catch (err) {
        console.error(err);
        return {
          statusCode: 500,
          body: JSON.stringify(err),
        };
      }
    } else {
      console.error({ event, context });
      throw new Error('unknown error');
    }
  };
}
