/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { Octokit } from '@octokit/core';

interface FileInformation {
  filename: string;
  url: string;
}

export default async function extractFilesFromPR(octokit: Octokit, commits_url: string): Promise<FileInformation[]> {
  const files: FileInformation[] = [];
  const result = await octokit.request(commits_url);
  for (const commit of result.data || []) {
    const commit_url = commit.url;
    if (!commit_url) {
      throw new Error(`missing commit_url`);
    }
    const result = await octokit.request(commit_url);
    (result.data.files || []).forEach((f: any) => {
      const existing = files.find((e) => e.filename === f.filename);
      // as a file may have been updated multiple times in the PR
      // we need to take the last edit
      if (existing) {
        existing.url = f.raw_url;
      } else {
        files.push({
          filename: f.filename,
          url: f.raw_url,
        });
      }
    });
  }

  return files;
}
