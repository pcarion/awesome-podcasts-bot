import axios from 'axios';
import path from 'path';
import { HandlePullRequestArg, HandlePullRequestResponse } from './types';
import addFilesToRepository from './gitutils/addFilesToRepository';
import mergePullRequest from './gitutils/mergePullRequest';
import enhancePodcast from './enhance/enhancePodcast';
import extractFilesFromPR from './extractFilesFromPR';
import validatePodcastYaml from './validatePodcastYaml';
import loadExistingPodcastYamlFiles from './loadExistingPodcastYamlFiles';
import checkPodcastModifications from './checks/checkPodcastModifications';
import mkReporter from './reporterPullRequests';

async function downloadFileContent(url: string): Promise<string> {
  const response = await axios({
    url: url,
    method: 'GET',
    responseType: 'text',
  });
  return response.data;
}

// async function downloadBinaryFile(destPath: string, url: string): Promise<void> {
//   await fs.ensureFile(destPath);
//   const writer = fs.createWriteStream(destPath);

//   const response = await axios({
//     url: url,
//     method: 'GET',
//     responseType: 'stream',
//   });
//   response.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on('finish', resolve);
//     writer.on('error', reject);
//   });
// }

export default async function handlePullRequestEvent({
  octokit,
  repoInformation,
  podcastYamlDirectory,
  podcastJsonDirectory,
  prNumber,
  commitsUrl,
  pullRequestBranch,
}: HandlePullRequestArg): Promise<HandlePullRequestResponse> {
  const reporter = mkReporter(octokit, repoInformation.owner, repoInformation.repo, prNumber);
  console.log(`>processing PR>pullRequestBranch>${pullRequestBranch}`);

  try {
    const files = await extractFilesFromPR(octokit, commitsUrl);
    reporter.info(`Files modified in PR: \n* ${files.map((f) => f.filename).join('\n* ')}`);
    if (files.length !== 1) {
      throw new Error(`PR must change one and only one file from the podcasts directory`);
    }
    const file = files[0];

    // load existing podcasts
    const existingPodcasts = await loadExistingPodcastYamlFiles(octokit, repoInformation, podcastYamlDirectory);

    // the file should be in the list of existing podcasts
    const originalPodcast = existingPodcasts.find((p) => p.yamlDescriptionFile === file.filename);
    if (!originalPodcast) {
      reporter.error(`file in PR is not an existing podcast file: ${file.filename}`);
      throw new Error(`a PR should only change an existing podcast file: ${file.filename}`);
    }
    // check that the file is a valid podcast description file
    const content = await downloadFileContent(file.url);
    const podcast = validatePodcastYaml(content, file.filename);

    console.log('>enhance podcast>', podcast.title);
    const podcastEnhanced = await enhancePodcast(podcast, path.basename(file.filename));

    // we check if the change are OK
    await checkPodcastModifications(originalPodcast, podcast);

    console.log(`>merging PR>prNumber>${prNumber}`);
    await mergePullRequest(octokit, repoInformation.owner, repoInformation.repo, prNumber);

    console.log('>adding to repository>');
    const addToRepository = await addFilesToRepository(octokit, repoInformation);
    const prJsonFile = `${podcastJsonDirectory}/${podcastEnhanced.pid}.json`;
    console.log('>adding to repository>file>', prJsonFile);
    await addToRepository.addJsonFile(prJsonFile, podcastEnhanced);

    console.log(`>pushing json to main branch>`);
    const sha = await addToRepository.commit(
      `adding podcast: ${podcastEnhanced.title} - ${podcastEnhanced.yamlDescriptionFile}`,
    );
    console.log(`>pushing json to main branch>${sha}`);
    await reporter.succeed('PR ok');
    return {
      isSuccess: true,
      fileName: file.filename,
      podcast: podcast,
    };
  } catch (err) {
    console.log(err);
    reporter.error(`processing error: ${err.message || err.toString()}`);
    reporter.info('');
    reporter.info('feel free to update your PR is you can fix that error');
    reporter.info('someone will review that error shortly in case this is an internal error');
    reporter.info('');
    reporter.info('Thank you for your submission!');

    await reporter.fail('error processing PR');
    return {
      isSuccess: false,
      errorMessage: err.message || err.toString(),
    };
  }
}
