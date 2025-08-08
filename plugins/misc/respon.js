module.exports = {
  customPrefix: /^(bot)$/i,
  command: new RegExp(),
  run: async (m, {}) => {
    await m.reply("🚀 [ STATUS: ONLINE ] ✅");
  }
};