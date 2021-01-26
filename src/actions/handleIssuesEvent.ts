import { HandleIssueArg, HandleIssueResponse } from './types';
import enhancePodcast from './enhance/enhancePodcast';
import processCandidateUrl from './processCandidateUrl';
import addFilesToRepository from './gitutils/addFilesToRepository';
import loadExistingPodcastFiles from './loadExistingPodcastFiles';
import checkForDuplicatePodcast from './checks/checkForDuplicatePodcast';
import mkReporter from './reporterIssues';

export default async function handleIssuesEvent({
  octokit,
  repoInformation,
  podcastYamlDirectory,
  podcastJsonDirectory,
  issueNumber,
  title,
}: HandleIssueArg): Promise<HandleIssueResponse> {
  const urlCandidate = title.trim();
  const reporter = mkReporter(octokit, repoInformation.owner, repoInformation.repo, issueNumber);

  try {
    // process the URL to get associated podcast
    const result = await processCandidateUrl(urlCandidate, issueNumber, reporter);
    console.log('>podcast from candidate URL>', result.podcast);

    // load existing podcasts
    const podcasts = await loadExistingPodcastFiles(octokit, repoInformation, podcastYamlDirectory);

    // before we can add this podcast, we need to check that this is not a duplicate
    await checkForDuplicatePodcast(podcasts, result.podcast);

    console.log('>enhance podcast>', result.podcast);
    const podcastEnhanced = await enhancePodcast(result.podcast, result.fileName);
    console.log('>enhanced as>', podcastEnhanced);

    console.log('>adding to respository>');
    const addToRepository = await addFilesToRepository(octokit, repoInformation);
    await addToRepository.addFileWithlines(`${podcastYamlDirectory}/${result.fileName}`, result.lines);
    await addToRepository.addJsonFile(`${podcastJsonDirectory}/${podcastEnhanced.pid}.json`, podcastEnhanced);

    await addToRepository.commit(`adding podcast: ${podcastEnhanced.title} - ${podcastEnhanced.yamlDescriptionFile}`);

    reporter.info('');
    reporter.info(`Your submission was successfully added in: \`${result.fileName}\``);
    reporter.info('The site will be regenerated automatically shortly and your submission will appear soon there');
    reporter.info('');
    reporter.info('Thank you for your submission!');

    await reporter.succeed('new podcast');
    return {
      candidateUrl: urlCandidate,
      isSuccess: true,
      errorMessage: '',
      podcast: result.podcast,
      fileName: result.fileName,
    };
  } catch (err) {
    reporter.error(`processing error: ${err.message || err.toString()}`);
    reporter.info('');
    reporter.info('if you see an error in the URL, you can update the title of the ticket with the proper URL');
    reporter.info('someone will review that error shortly in case this is an internal error');
    reporter.info('');
    reporter.info('Thank you for your submission!');

    await reporter.fail('error adding podcast');
    return {
      candidateUrl: urlCandidate,
      isSuccess: false,
      errorMessage: err.message || err.toString(),
    };
  }
}
