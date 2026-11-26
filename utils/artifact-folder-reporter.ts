import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

export default class ArtifactFolderReporter implements Reporter {
  private readonly traceDirectory = path.resolve('trace-report');
  private readonly videoDirectory = path.resolve('videos');

  async onBegin(): Promise<void> {
    await Promise.all([
      mkdir(this.traceDirectory, { recursive: true }),
      mkdir(this.videoDirectory, { recursive: true }),
    ]);
  }

  async onTestEnd(test: TestCase, result: TestResult): Promise<void> {
    const fileName = `${path.basename(test.location.file)}-${test.title}-${test.id.slice(0, 8)}`
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '-')
      .slice(0, 140);

    for (const attachment of result.attachments) {
      if (!attachment.path) {
        continue;
      }

      const directory =
        attachment.name === 'trace'
          ? this.traceDirectory
          : attachment.name === 'video'
            ? this.videoDirectory
            : undefined;
      if (!directory) {
        continue;
      }

      const extension = attachment.name === 'trace' ? '.zip' : '.webm';
      await copyFile(
        attachment.path,
        path.join(directory, `${fileName}-retry-${result.retry}${extension}`),
      );
    }
  }

  printsToStdio(): boolean {
    return false;
  }
}
