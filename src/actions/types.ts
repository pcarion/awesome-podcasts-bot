import { ProbotOctokit } from 'probot';
import { getOctokit } from '@actions/github';
import { Podcast } from './jtd/podcast';

export type GithubOctokit = ReturnType<typeof getOctokit>;

export type BotOctokit = InstanceType<typeof ProbotOctokit>;

export type Octokit = GithubOctokit | BotOctokit;

export interface RepoInformation {
  owner: string;
  repo: string;
  defaultBranch: string;
  description: string | null;
}

export interface FileInformation {
  name: string;
  path: string;
  destPath: string;
  download_url: string;
  content?: string;
}

export interface PodcastEnhancedColors {
  vibrant: string | null;
  darkVibrant: string | null;
  lightVibrant: string | null;
  muted: string | null;
  darkMuted: string | null;
  lightMuted: string | null;
}

export interface PodcastEnhancedEpisode {
  publishingDate: string;
}

export interface PodcastEnhanced extends Podcast {
  extra: {
    timestamp: number; // timestamp of the most recent published podcast
    logoRepoImage?: string;
    colors: PodcastEnhancedColors;
    episodes: PodcastEnhancedEpisode[];
  };
}

export interface Reporter {
  info(i: string): void;
  error(i: string): void;

  succeed(label: string): Promise<void>;
  fail(label: string): Promise<void>;
}

export interface HandleIssueArg {
  octokit: Octokit;
  repoInformation: RepoInformation;
  podcastYamlDirectory: string;
  podcastJsonDirectory: string;
  podcastMetaDirectory: string;
  issueNumber: number;
  title: string;
}

export interface HandleIssueResponse {
  candidateUrl: string;
  isSuccess: boolean;
  errorMessage?: string;
  podcast?: Podcast;
  fileName?: string;
}

export interface HandlePullRequestArg {
  octokit: Octokit;
  repoInformation: RepoInformation;
  podcastYamlDirectory: string;
  podcastJsonDirectory: string;
  podcastMetaDirectory: string;
  prNumber: number;
  commitsUrl: string;
  pullRequestBranch: string;
}

export interface HandlePullRequestResponse {
  isSuccess: boolean;
  errorMessage?: string;
  podcast?: Podcast;
  fileName?: string;
}

export interface HandleRegenerateAllJsonFilesArg {
  octokit: Octokit;
  repoInformation: RepoInformation;
  podcastYamlDirectory: string;
  podcastJsonDirectory: string;
  podcastMetaDirectory: string;
}
export interface HandleRegenerateAllJsonFilesResponse {
  isSuccess: boolean;
  errorMessage?: string;
}
