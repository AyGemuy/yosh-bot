module.exports = {
  run: async (m, {
    quoted,
    users,
    Func
  }) => {
    users.afk = +new Date();
    users.afkReason = quoted.text;
    const reason = quoted.text ? `*Alasan* : _${quoted.text}_` : "Tanpa keterangan";
    const afkMessage = `
╭─[ ⏳ STATUS AFK ⏳ ]
│
│ *Pengguna* : @${m.sender.split("@")[0]}
│ *Mode* : AFK (Away From Keyboard)
│ ${reason}
│
╰─[ 💬 Pesan Tidak Tersedia ]
`.trim();
    m.reply(afkMessage, {
      mentions: [m.sender]
    });
  },
  help: ["afk"],
  tags: ["group"],
  command: ["afk"]
};