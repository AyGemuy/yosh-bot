const config = require("@system/config");
const moment = require("moment-timezone");
module.exports = {
  command: /^(hitstat|hitdaily)$/i,
  run: async (m, {
    conn,
    Func
  }) => {
    let totalhit = Object.values(db.stats).reduce((sum, {
      hitstat
    }) => sum + hitstat, 0);
    let totaltoday = Object.values(db.stats).reduce((sum, {
      today
    }) => sum + today, 0);
    const isHitStat = m.command === "hitstat";
    const title = isHitStat ? "H I T S T A T" : "H I T D A I L Y";
    const totalText = isHitStat ? `“Total statistik hit perintah saat ini adalah *${Func.formatNumber(totalhit)}* hits.”` : `“Total statistik hit perintah untuk hari ini adalah *${Func.formatNumber(totaltoday)}* hits.”`;
    const noHitText = isHitStat ? "Belum ada perintah yang digunakan." : "Belum ada perintah yang digunakan hari ini.";
    const currentTotal = isHitStat ? totalhit : totaltoday;
    if (currentTotal === 0) {
      return m.reply(`\n╭─[ 📈 ${title} 📉 ]\n│\n│ *Status* : ${noHitText}\n│\n╰─[ 📊 Data Tidak Ditemukan ]\n`.trim());
    }
    let stats = Object.entries(db.stats).filter(([, data]) => (isHitStat ? data.hitstat : data.today) > 0).slice(0, 10).sort(([, a], [, b]) => (isHitStat ? b.hitstat : b.today) - (isHitStat ? a.hitstat : a.today)).map(([key, {
      hitstat,
      today,
      lasthit
    }]) => {
      const hits = isHitStat ? hitstat : today;
      const lastHitTime = moment(lasthit).format("DD/MM/YY HH:mm:ss");
      return `
╭───「 *CMD*: ${Func.texted("monospace", m.prefix + key)} 」
│ *Hit* : *${hits}x*
│ *Terakhir*: _${lastHitTime}_
╰───────────────
`.trim();
    }).join("\n");
    const replyMessage = `
╭─[ 📈 ${title} 📉 ]
│
│ ${totalText}
│
${stats}
│
╰─[ 📊 *INFORMASI LENGKAP* 📊 ]

${config.FOOTER || ""}
`.trim();
    m.reply(replyMessage);
  }
};