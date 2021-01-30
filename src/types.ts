import { Probot, ApplicationFunctionOptions } from 'probot';
import { WebhookEvent } from '@octokit/webhooks';

export type ApplicationFunction = (app: Probot, options: ApplicationFunctionOptions) => void;
export type WebhookEvents = WebhookEvent['name'];
