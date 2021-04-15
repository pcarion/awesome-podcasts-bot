import { Octokit } from '../types';

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), ms);
  });
}

export default async function mergePullRequest(
  octo: Octokit,
  owner: string,
  repo: string,
  pullRequestNumber: number,
): Promise<void> {
  // update pull request if extra files were added to the branch
  console.log(`>mergePullRequest>pr>${pullRequestNumber}>A`);
  await octo.pulls.get({
    owner,
    repo,
    pull_number: pullRequestNumber,
  });
  // console.log(`>mergePullRequest>pr>${pullRequestNumber}>B`);
  // await octo.pulls.update({
  //   owner,
  //   repo,
  //   pull_number: pullRequestNumber,
  // });
  // unfortunate, but seems to be required:
  // https://stackoverflow.com/questions/38796617/how-to-avoid-delaying-github-pull-request-merge-using-api
  console.log(`>mergePullRequest>pr>${pullRequestNumber}>C`);
  await sleep(5000);
  // console.log(`>mergePullRequest>pr>${pullRequestNumber}>D`);
  // await octo.pulls.get({
  //   owner,
  //   repo,
  //   pull_number: pullRequestNumber,
  // });

  // merging PR
  console.log(`>mergePullRequest>pr>${pullRequestNumber}>E`);
  await octo.pulls.merge({
    owner,
    repo,
    pull_number: pullRequestNumber,
    commit_title: `merge PR`,
    commit_message: `merge from PR #${pullRequestNumber}`,
    merge_method: 'squash',
  });
}
