module.exports = {
  command: /^(run|runtime|uptime)$/i,
  run: async (m, {
    Func
  }) => {
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (3600 * 24));
    const hours = Math.floor(uptimeSeconds % (3600 * 24) / 3600);
    const minutes = Math.floor(uptimeSeconds % 3600 / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    let uptimeDisplay = [];
    if (days > 0) uptimeDisplay.push(`${days} Hari`);
    if (hours > 0) uptimeDisplay.push(`${hours} Jam`);
    if (minutes > 0) uptimeDisplay.push(`${minutes} Menit`);
    uptimeDisplay.push(`${seconds} Detik`);
    const totalMemory = (process.memoryUsage().rss / (1024 * 1024 * 1024)).toFixed(2);
    const usedMemory = (process.memoryUsage().heapUsed / (1024 * 1024 * 1024)).toFixed(2);
    const platform = process.platform;
    const arch = process.arch;
    const nodeVersion = process.version;
    const replyMessage = `
╭─[ 🌐 *SISTEM AKTIF* 🌐 ]
│
│ *Status* : Online & Beroperasi ✅
│ *Uptime* : ${uptimeDisplay.join(", ")}
│ *Mulai Sejak* : ${Func.toDate(uptimeSeconds * 1e3)}
│
│ *—[ Detail Proses ]—*
│ *Platform* : ${platform} (${arch})
│ *Node.js Ver* : ${nodeVersion}
│ *Memori Digunakan*: ${usedMemory} GB / ${totalMemory} GB
│
╰─[ 📊 *DATA METRIK* 📊 ]
`.trim();
    m.reply(replyMessage);
  }
};