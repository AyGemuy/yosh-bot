module.exports = {
  async before(m, {
    Func,
    conn,
    users
  }) {
    if (users.afk > -1) {
      const afkDuration = Func.toTime(new Date() - users.afk);
      const afkReasonText = users.afkReason ? `*Setelah*: _${users.afkReason}_` : "";
      const returnMessage = `
╭─[ ✨ KEMBALI ONLINE ✨ ]
│
│ *Halo* @${m.sender.split("@")[0]}, Kamu telah kembali!
│ Kamu AFK ${afkReasonText}
│ *Selama*: ${afkDuration}
│
╰─[ ✅ STATUS: AKTIF ✅ ]
`.trim();
      m.reply(returnMessage, {
        mentions: [m.sender]
      });
      users.afk = -1;
      users.afkReason = "";
    }
    let jids = [...new Set([...m.mentions || [], ...m.quoted ? [m.quoted.sender] : []])];
    for (let jid of jids) {
      let user = db.users[jid];
      if (!user) continue;
      let afkTime = user.afk;
      if (!afkTime || afkTime < 0) continue;
      const afkDuration = Func.toTime(new Date() - afkTime);
      const afkReasonText = user.afkReason ? `_Alasan: ${user.afkReason}_` : "Tanpa keterangan";
      const afkUserDisplayName = conn.getName(jid);
      const afkNotification = `
╭─[ 🚨 PEMBERITAHUAN AFK 🚨 ]
│
│ *Perhatian!*
│ *${afkUserDisplayName}* (@${jid.split("@")[0]})
│ Sedang *AFK* (Away From Keyboard).
│ ${afkReasonText}
│ *Sejak*: ${afkDuration} yang lalu.
│
╰─[ 😴 Jangan Diganggu Dulu 😴 ]
`.trim();
      m.reply(afkNotification, {
        mentions: [jid]
      });
    }
    return true;
  }
};