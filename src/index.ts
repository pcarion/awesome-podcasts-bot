import { Probot, WebhookPayloadWithRepository } from 'probot';
import { RepoInformation } from './actions/types';
import { ApplicationFunction } from './types';
import handleIssuesEvent from './actions/handleIssuesEvent';
import handlePullRequestEvent from './actions/handlePullRequestEvent';
import getConfigurationData from './actions/gitutils/getConfigurationData';

type PayloadRepository = WebhookPayloadWithRepository['repository'];

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
      const issueComment = context.issue({
        body: "Merci pour votre soumission! L'issue sera fermée automatiquement si elle est valide",
      });
      await context.octokit.issues.createComment(issueComment);

      const issueNumber = context.payload.issue.number;
      const title = context.payload.issue.title;

      const repoInformation = getRepositoryInformation(context.payload.repository);
      const { podcastYamlDirectory, podcastJsonDirectory, podcastMetaDirectory } = await getConfigurationData(
        context.octokit,
        repoInformation,
      );

      await handleIssuesEvent({
        octokit: context.octokit,
        repoInformation,
        podcastYamlDirectory,
        podcastJsonDirectory,
        podcastMetaDirectory,
        issueNumber,
        title,
      });
    } catch (err) {
      console.log('issues.opened.error', err);
    }
  });

  app.on(['pull_request.opened', 'pull_request.edited'], async (context) => {
    try {
      const issueComment = context.issue({
        body: 'Merci pour votre soumission! La PR sera fermée automatiquement si elle est valide',
      });
      await context.octokit.issues.createComment(issueComment);
      const repoInformation = getRepositoryInformation(context.payload.repository);
      const prNumber = context.payload.number;
      const commitsUrl = context.payload.pull_request.commits_url;
      const pullRequestBranch = context.payload.pull_request.head.ref;

      // retrieve specific configuration
      const { podcastYamlDirectory, podcastJsonDirectory, podcastMetaDirectory } = await getConfigurationData(
        context.octokit,
        repoInformation,
      );

      await handlePullRequestEvent({
        octokit: context.octokit,
        repoInformation,
        podcastYamlDirectory,
        podcastJsonDirectory,
        podcastMetaDirectory,
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
