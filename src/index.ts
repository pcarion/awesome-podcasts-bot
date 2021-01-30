import { Probot, WebhookPayloadWithRepository } from 'probot';
import { RepoInformation } from './actions/types';
import handleIssuesEvent from './actions/handleIssuesEvent';
import handlePullRequestEvent from './actions/handlePullRequestEvent';
import { ApplicationFunction } from './types';

type PayloadRepository = WebhookPayloadWithRepository['repository'];

const podcastYamlDirectory = process.env['AWESOME_PODCAST_YAML_DIRECTORY'];
const podcastJsonDirectory = process.env['AWESOME_PODCAST_JSON_DIRECTORY'];

if (!podcastJsonDirectory || !podcastYamlDirectory) {
  throw new Error(`missing environment variables`);
}

function getRepositoryInformation(repository: PayloadRepository): RepoInformation {
  if (!repository) {
    throw new Error('internal error');
  }
  const repoInformation: RepoInformation = {
    owner: repository.owner.login,
    repo: repository.name,
    defaultBranch: repository.default_branch,
    description: repository.description,
  };
  return repoInformation;
}

const appFunction: ApplicationFunction = (app: Probot) => {
  app.on(['issues.opened', 'issues.edited'], async (context) => {
    try {
      const issueNumber = context.payload.issue.number;
      const title = context.payload.issue.title;

      const repoInformation = getRepositoryInformation(context.payload.repository);

      await handleIssuesEvent({
        octokit: context.octokit,
        repoInformation,
        podcastsDirectory: podcastYamlDirectory,
        podcastJsonDirectory: podcastJsonDirectory,
        issueNumber,
        title,
      });
      // const issueComment = context.issue({
      //   body: 'Thanks for opening this issue!',
      // });
      // await context.octokit.issues.createComment(issueComment);
    } catch (err) {
      console.log('issues.opened.error', err);
    }
  });

  app.on(['pull_request.opened', 'pull_request.edited'], async (context) => {
    try {
      const repoInformation = getRepositoryInformation(context.payload.repository);
      const prNumber = context.payload.number;
      const commitsUrl = context.payload.pull_request.commits_url;
      const pullRequestBranch = context.payload.pull_request.head.ref;

      await handlePullRequestEvent({
        octokit: context.octokit,
        repoInformation,
        podcastsDirectory: podcastYamlDirectory,
        podcastJsonDirectory: podcastJsonDirectory,
        prNumber,
        commitsUrl,
        pullRequestBranch,
      });
    } catch (err) {
      console.log('pull_request.opened', err);
    }
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};

export default appFunction;
