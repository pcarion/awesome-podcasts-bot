import { Probot, ProbotOctokit, ApplicationFunctionOptions } from 'probot';
import { WebhookEvent } from '@octokit/webhooks';

export type Octokit = InstanceType<typeof ProbotOctokit>;

export type ApplicationFunction = (app: Probot, options: ApplicationFunctionOptions) => void;
export type WebhookEvents = WebhookEvent['name'];
