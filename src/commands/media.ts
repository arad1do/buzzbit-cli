/**
 * `bbx media upload` — upload an image / video from disk to the workspace's
 * Supabase-backed media store. Wraps `upload_media`.
 *
 * The MCP tool accepts base64-encoded content for files up to 8MB (images)
 * or 100MB (video) — per the server-side storageService caps. We read the
 * file from disk, encode it, and pass it through.
 */

import { Command } from 'commander';
import { readFileSync, statSync } from 'node:fs';
import { basename, extname } from 'node:path';
import { callTool } from '../lib/mcpClient.js';
import { parseFormat, printRecord } from '../lib/formatter.js';
import { ValidationError } from '../lib/errors.js';

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm']);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const MIME_BY_EXT: Readonly<Record<string, string>> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

function buildUploadCommand(): Command {
  return new Command('upload')
    .description('Upload an image or video from disk')
    .requiredOption('--file <path>', 'Local file path')
    .option('--name <name>', 'Override the stored filename (default: basename of --file)')
    .option('--format <format>', 'table | json', 'table')
    .action(async (opts: { file: string; name?: string; format?: string }) => {
      const ext = extname(opts.file).toLowerCase();
      const isImage = IMAGE_EXTS.has(ext);
      const isVideo = VIDEO_EXTS.has(ext);
      if (!isImage && !isVideo) {
        throw new ValidationError(
          `Unsupported file extension "${ext}". Supported: ${[...IMAGE_EXTS, ...VIDEO_EXTS].join(', ')}`,
        );
      }

      let stats;
      try {
        stats = statSync(opts.file);
      } catch (err) {
        throw new ValidationError(
          `Cannot stat ${opts.file}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
      const cap = isImage ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
      if (stats.size > cap) {
        const capMb = (cap / (1024 * 1024)).toFixed(0);
        const sizeMb = (stats.size / (1024 * 1024)).toFixed(1);
        throw new ValidationError(`File is ${sizeMb}MB (cap ${capMb}MB for this type).`);
      }

      const buffer = readFileSync(opts.file);
      const fileName = opts.name ?? basename(opts.file);
      const mimeType = MIME_BY_EXT[ext] ?? 'application/octet-stream';

      const result = await callTool('upload_media', {
        fileName,
        mimeType,
        contentBase64: buffer.toString('base64'),
        sizeBytes: stats.size,
      });
      printRecord(result, parseFormat(opts.format));
    });
}

export function buildMediaCommand(): Command {
  return new Command('media')
    .description('Upload media (images / videos) for use in social posts and emails')
    .addCommand(buildUploadCommand());
}
