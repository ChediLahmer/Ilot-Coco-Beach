import { spawn } from "child_process";
import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const FFMPEG_BIN = process.env.FFMPEG_PATH || ffmpegInstaller?.path || "ffmpeg";

export async function remuxVideoWithFaststart(buffer) {
  const tmpDir = tmpdir();
  const inputFile = join(
    tmpDir,
    `input-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`,
  );
  const outputFile = join(
    tmpDir,
    `output-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`,
  );

  try {
    writeFileSync(inputFile, buffer);

    await new Promise((resolve, reject) => {
      const ffmpeg = spawn(FFMPEG_BIN, [
        "-i",
        inputFile,
        "-c",
        "copy",
        "-movflags",
        "+faststart",
        "-y",
        outputFile,
      ]);

      let stderr = "";
      ffmpeg.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      ffmpeg.on("close", (code) => {
        if (code !== 0) {
          reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`));
        } else {
          resolve();
        }
      });

      ffmpeg.on("error", (err) => {
        reject(err);
      });
    });

    const remuxedBuffer = readFileSync(outputFile);
    return remuxedBuffer;
  } finally {
    try {
      unlinkSync(inputFile);
    } catch (e) {
      /* ignore */
    }
    try {
      unlinkSync(outputFile);
    } catch (e) {
      /* ignore */
    }
  }
}
