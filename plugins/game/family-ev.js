module.exports = {
  async before(m, {
    Func,
    conn,
    users,
    quoted
  }) {
    conn.temp = conn.temp || {};
    conn.temp.family100 = conn.temp.family100 || {};
    const session = conn.temp.family100[m.chat];
    if (!session || session.status !== "playing") {
      return true;
    }
    let userAnswer;
    console.log(quoted);
    if (quoted && quoted.id === session.messageId) {
      userAnswer = m.body ? m.body.toLowerCase().trim() : "";
      console.log(m);
      console.log(`[Family100 Before] Pesan adalah balasan ke game: ${userAnswer} dari ${m.sender.split("@")[0]}`);
    } else {
      return true;
    }
    if (!userAnswer) {
      console.log(`[Family100 Before] Jawaban kosong dari ${m.sender.split("@")[0]}`);
      return true;
    }
    let foundCorrectAnswer = false;
    let pointsEarned = 0;
    const senderJid = m.sender;
    for (let i = 0; i < session.jawaban.length; i++) {
      const correctAnswer = session.jawaban[i].text.toLowerCase().trim();
      if (userAnswer === correctAnswer && !session.jawaban[i].found) {
        session.jawaban[i].found = true;
        session.jawaban[i].finder = senderJid;
        session.jawabanCount++;
        pointsEarned = 10;
        session.score[senderJid] = (session.score[senderJid] || 0) + pointsEarned;
        session.players.add(senderJid);
        foundCorrectAnswer = true;
        console.log(`[Family100 Before] Jawaban BENAR: '${userAnswer}' oleh ${senderJid.split("@")[0]}. Jawaban ke-${session.jawabanCount} ditemukan.`);
        break;
      }
    }
    if (foundCorrectAnswer) {
      m.react("✅");
      let answeredList = session.jawaban.filter(j => j.found).map(j => {
        const finderTag = `@${j.finder.split("@")[0]}`;
        return ` • ${j.text} (Oleh: ${finderTag})`;
      }).join("\n");
      const replyMessage = `
*🎉 BENAR!*
Jawaban: *${userAnswer}* ditemukan oleh *@${senderJid.split("@")[0]}*!
Poin Anda: *${session.score[senderJid]}*

---
*Jawaban Terjawab (${session.jawabanCount}/${session.totalJawaban}):*
${answeredList}
---
Sisa *${session.totalJawaban - session.jawabanCount}* jawaban lagi.
            `.trim();
      const mentionsArray = Array.from(session.players).map(jid => jid);
      const sentReplyMessage = await conn.reply(m.chat, replyMessage, m, {
        mentions: mentionsArray
      });
      session.messageId = sentReplyMessage.key.id;
      console.log(`[Family100 Before] Pesan update game dikirim, messageId baru: ${session.messageId}`);
      if (session.jawabanCount === session.totalJawaban) {
        clearTimeout(session.timeout);
        console.log(`[Family100 Before] Semua jawaban ditemukan di chat ID: ${m.chat}. Mengakhiri game.`);
        let finalScores = Object.entries(session.score).sort(([, scoreA], [, scoreB]) => scoreB - scoreA).map(([jid, score]) => `@${jid.split("@")[0]}: ${score} poin`).join("\n");
        if (finalScores === "") {
          finalScores = "Tidak ada yang berhasil menjawab.";
        }
        m.reply(`
🥳 *GAME SELESAI!* 🥳
Semua ${session.totalJawaban} jawaban Family 100 telah ditemukan!

Soal: *${session.soal}*

*Daftar Jawaban & Penemu:*
${session.jawaban.map(j => ` • ${j.text} (Oleh: ${j.finder ? `@${j.finder.split("@")[0]}` : "Belum ditemukan"})`).join("\n")}

---
*Papan Skor Akhir:*
${finalScores}
                `.trim(), {
          mentions: Array.from(session.players)
        });
        for (const jid of session.players) {
          if (global.db && global.db.users && global.db.users[jid]) {
            global.db.users[jid].exp = (global.db.users[jid].exp || 0) + session.score[jid];
            console.log(`[Family100 Before] Menambahkan ${session.score[jid]} EXP ke ${jid.split("@")[0]}`);
          } else {
            console.warn(`[Family100 Before] User ${jid} not found in global.db.users. Cannot update score.`);
          }
        }
        delete conn.temp.family100[m.chat];
        console.log(`[Family100 Before] Sesi game dihapus untuk chat ID: ${m.chat} (game selesai)`);
      }
    } else {
      if (quoted && quoted.id === session.messageId) {
        m.react("❌");
        console.log(`[Family100 Before] Jawaban SALAH: '${userAnswer}' dari ${m.sender.split("@")[0]}`);
      }
    }
    return true;
  }
};