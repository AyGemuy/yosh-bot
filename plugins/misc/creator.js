module.exports = {
  command: /^(owner|creator)$/i,
  run: async (m, {
    conn,
    Func,
    setting
  }) => {
    if (!Array.isArray(JSON.parse(setting.owners)) || JSON.parse(setting.owners).length === 0) {
      console.warn("JSON.parse(setting.owners) tidak ditemukan atau kosong.");
      return m.reply("Nomor owner belum disetel.");
    }
    await conn.sendContact(m.chat, JSON.parse(setting.owners), m, {
      ephemeralExpiration: m.expiration
    });
  }
};