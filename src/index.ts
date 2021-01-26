import { Probot } from 'probot';
import handleIssuesEvent from './actions/handleIssuesEvent';
import { RepoInformation } from './actions/types';

const podcastYamlDirectory = process.env['AWESOME_PODCAST_YAML_DIRECTORY'];
const podcastJsonDirectory = process.env['AWESOME_PODCAST_JSON_DIRECTORY'];

if (!podcastJsonDirectory || !podcastYamlDirectory) {
  throw new Error(`missing environment variables`);
}

export = (app: Probot): void => {
  app.on('issues.opened', async (context) => {
    try {
      console.log('@@@ issues.opened....', JSON.stringify(context, null, 2));
      const issueNumber = context.payload.issue.number;
      const title = context.payload.issue.title;

      const repoInformation: RepoInformation = {
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        defaultBranch: context.payload.repository.default_branch,
        description: context.payload.repository.description,
      };

      await handleIssuesEvent({
        octokit: context.octokit,
        repoInformation,
        podcastsDirectory: podcastYamlDirectory,
        podcastJsonDirectory: podcastJsonDirectory,
        issueNumber,
        title,
      });
      const issueComment = context.issue({
        body: 'Thanks for opening this issue!',
      });
      await context.octokit.issues.createComment(issueComment);
    } catch (err) {
      console.log('issues.opened.error', err);
    }
  });

  app.on('pull_request.opened', async (context) => {
    try {
      console.log('@@@ pull_request.opened....', JSON.stringify(context, null, 2));
    } catch (err) {
      console.log('pull_request.opened', err);
    }
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
};
