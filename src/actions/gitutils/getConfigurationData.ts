import { Octokit, RepoInformation } from '../types';
import retrieveYamlContentFromRepository from './retrieveYamlContentFromRepository';

const BOT_CONFIGFILE = '.awesome-podcasts-bot.yaml';

interface ConfigurationData {
  podcastYamlDirectory: string;
  podcastJsonDirectory: string;
  podcastMetaDirectory: string;
}

export default async function getConfigurationData(
  octo: Octokit,
  repoInformation: RepoInformation,
): Promise<ConfigurationData> {
  // retrieve specific configuration
  const botconfig = await retrieveYamlContentFromRepository(octo, repoInformation, BOT_CONFIGFILE);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const podcastYamlDirectory = (botconfig as any).config.podcastYamlDirectory;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const podcastJsonDirectory = (botconfig as any).config.podcastJsonDirectory;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const podcastMetaDirectory = (botconfig as any).config.podcastMetaDirectory;
  if (!podcastJsonDirectory || !podcastYamlDirectory || !podcastMetaDirectory) {
    console.log(`>invalid bot config>${BOT_CONFIGFILE}>`, botconfig);
    throw new Error(`missing configuration variables from ${BOT_CONFIGFILE}`);
  }
  return {
    podcastYamlDirectory,
    podcastJsonDirectory,
    podcastMetaDirectory,
  };
}
