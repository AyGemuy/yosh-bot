const axios = require("axios");
module.exports = {
  run: async (m, {
    Func,
    API,
    conn
  }) => {
    console.log(`[Family100] Perintah '.family100' diterima dari chat ID: ${m.chat}`);
    conn.temp = conn.temp || {};
    conn.temp.family100 = conn.temp.family100 || {};
    if (conn.temp.family100[m.chat] && conn.temp.family100[m.chat].status === "playing") {
      console.log(`[Family100] Game sudah berlangsung di chat ID: ${m.chat}`);
      return m.reply("⚠️ Game Family 100 sedang berlangsung di grup ini. Selesaikan dulu sesi yang ada atau ketik `.family100 stop` untuk mengakhirinya.");
    }
    try {
      console.log(`[Family100] Mengambil soal dari API: ${API("wudysoft", "/api/game/family100")}`);
      const family100Api = API("wudysoft", "/api/game/family100");
      const {
        data
      } = await axios.get(family100Api);
      if (!data || !data.soal || !data.jawaban || data.jawaban.length === 0) {
        console.warn(`[Family100] Data soal atau jawaban tidak lengkap dari API untuk chat ID: ${m.chat}`);
        return m.reply("Terjadi kesalahan saat mengambil soal Family 100 atau data tidak lengkap. Silakan coba lagi nanti.");
      }
      const {
        soal,
        jawaban
      } = data;
      const formattedJawaban = jawaban.map(ans => ({
        text: ans,
        found: false,
        finder: null
      }));
      const totalJawaban = jawaban.length;
      const initialMessage = `
*🎉 FAMILY 100 DIMULAI!*
Soal: *${soal}*

---
Tersisa *${totalJawaban}* jawaban yang belum ditemukan.
Kirim jawabanmu di sini! Setiap jawaban benar akan mendapatkan poin.
Game ini akan berakhir dalam 2 menit.
            `.trim();
      const sentMessage = await conn.reply(m.chat, initialMessage, m);
      console.log(`[Family100] Game dimulai di chat ID: ${m.chat}, messageId: ${sentMessage.key.id}`);
      conn.temp.family100[m.chat] = {
        soal: soal,
        jawaban: formattedJawaban,
        jawabanCount: 0,
        totalJawaban: totalJawaban,
        score: {},
        players: new Set(),
        status: "playing",
        startTime: Date.now(),
        messageId: sentMessage.key.id,
        timeout: setTimeout(() => {
          const session = conn.temp.family100[m.chat];
          if (session && session.status === "playing") {
            console.log(`[Family100] Waktu habis untuk game di chat ID: ${m.chat}`);
            let finalScores = Object.entries(session.score).sort(([, scoreA], [, scoreB]) => scoreB - scoreA).map(([jid, score]) => `@${jid.split("@")[0]}: ${score} poin`).join("\n");
            if (finalScores === "") {
              finalScores = "Tidak ada yang berhasil menjawab.";
            }
            m.reply(`⏰ Waktu Family 100 telah habis!\n\nSoal: *${session.soal}*\nJawaban yang benar adalah: ${session.jawaban.map(j => j.text).join(", ")}\n\nHasil Akhir:\n${finalScores}`, {
              mentions: Object.keys(session.score)
            });
            delete conn.temp.family100[m.chat];
            console.log(`[Family100] Sesi game dihapus untuk chat ID: ${m.chat} (timeout)`);
          }
        }, 12e4)
      };
    } catch (error) {
      console.error(`[Family100] Error saat memulai game di chat ID: ${m.chat}`, error);
      m.reply("Maaf, terjadi kesalahan saat mengambil soal. Silakan coba lagi nanti.");
    }
  },
  help: ["family100"],
  tags: ["game"],
  command: ["family100"]
};