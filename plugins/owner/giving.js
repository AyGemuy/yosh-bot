module.exports = {
  help: ["pay"],
  tags: ["owner"],
  command: /^(pay)$/i,
  run: async (m, {
    conn,
    isOwner
  }) => {
    let type = (m.args[0] || "").toLowerCase();
    let cht = (m.args[0] || "").toLowerCase();
    let who = m.mentions && m.mentions[0] ? m.mentions[0] : m.fromMe ? conn.user.jid : m.sender;
    let mentionedJid = [who];
    let cok = `What can be added Exp, Money, Limit
  Example : ${m.prefix}pay exp 10 @0`;
    try {
      if (/pay/i.test(m.command)) {
        const count = m.args[1] && m.args[1].length > 0 ? Math.max(parseInt(m.args[1]), 1) : !m.args[1] || m.args.length < 3 ? 1 : Math.min(1, count);
        switch (type) {
          case "exp":
            if (typeof db.users[who] == "undefined") return m.reply("The user does not exist in the database");
            db.users[who].exp += count * 1;
            m.reply(`Added successfully ${count * 1} ${type}`);
            break;
          case "money":
            if (typeof db.users[who] == "undefined") return m.reply("The user does not exist in the database");
            db.users[who].money += count * 1;
            m.reply(`Added successfully ${count * 1} ${type}`);
            break;
          case "limit":
            if (typeof db.users[who] == "undefined") return m.reply("The user does not exist in the database");
            db.users[who].limit += count * 1;
            m.reply(`Added successfully ${count * 1} ${type}`);
            break;
          default:
            return m.reply(cok);
        }
      }
    } catch (e) {
      return m.reply(cok);
    }
  },
  owner: true
};