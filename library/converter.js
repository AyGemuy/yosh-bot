const fs = require("fs");
const path = require("path");
const {
  spawn,
  exec
} = require("child_process");

function ffmpeg(buffer, args = [], ext = "", ext2 = "") {
  return new Promise(async (resolve, reject) => {
    try {
      let tmp = path.join(__dirname, "../tmp", +new Date() + "." + ext);
      let out = tmp + "." + ext2;
      await fs.promises.writeFile(tmp, buffer);
      spawn("ffmpeg", ["-y", "-i", tmp, ...args, out]).on("error", reject).on("close", async code => {
        try {
          await fs.promises.unlink(tmp);
          if (code !== 0) return reject(code);
          resolve({
            data: await fs.promises.readFile(out),
            filename: out,
            delete() {
              return fs.promises.unlink(out);
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

function toPTT(buffer, ext) {
  return ffmpeg(buffer, ["-vn", "-c:a", "libopus", "-b:a", "128k", "-vbr", "on"], ext, "ogg");
}

function toAudio(buffer, ext) {
  return ffmpeg(buffer, ["-vn", "-c:a", "libopus", "-b:a", "128k", "-vbr", "on", "-compression_level", "10"], ext, "opus");
}

function toVideo(buffer, ext) {
  return ffmpeg(buffer, ["-c:v", "libx264", "-c:a", "aac", "-ab", "128k", "-ar", "44100", "-crf", "32", "-preset", "slow"], ext, "mp4");
}

function videoConvert(buffer, input = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const tmp = path.join(__dirname, "../tmp", `${+new Date()}.mp4`);
      await fs.promises.writeFile(tmp, buffer);
      const out = tmp.replace(".mp4", "_converted.mp4");
      const args = ["-y", "-i", tmp, ...input, out];
      spawn("ffmpeg", args).on("error", reject).on("close", async code => {
        try {
          await fs.promises.unlink(tmp);
          if (code !== 0) return reject(code);
          const outputVideoBuffer = await fs.promises.readFile(out);
          await fs.promises.unlink(out);
          resolve(outputVideoBuffer);
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

function webpToVideo(bufferImage) {
  return new Promise((resolve, reject) => {
    try {
      let pathFile = path.join(__dirname, "../tmp", +new Date() + ".webp");
      fs.writeFileSync(pathFile, bufferImage);
      exec(`convert ${pathFile} ${pathFile}.gif`, (error, stdout, stderr) => {
        exec(`ffmpeg -i ${pathFile}.gif -movflags faststart -pix_fmt yuv420p -vf 'scale=trunc(iw/2)*2:trunc(ih/2)*2' ${pathFile}.mp4`, (error, stdout, stderr) => {
          if (!fs.existsSync(pathFile + ".gif") || !fs.existsSync(pathFile + ".mp4")) {
            reject(error);
            return;
          }
          let videoBuffer = fs.readFileSync(pathFile + ".mp4");
          resolve(videoBuffer);
        });
      });
    } catch (e) {
      reject(e);
    }
  });
}
module.exports = {
  ffmpeg: ffmpeg,
  toPTT: toPTT,
  toAudio: toAudio,
  toVideo: toVideo,
  videoConvert: videoConvert,
  webpToVideo: webpToVideo
};