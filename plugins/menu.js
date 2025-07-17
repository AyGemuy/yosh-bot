const config = require("@system/config");
module.exports = {
  command: /^(menu|help|listmenu|list)$/i,
  run: async (m, {
    Func,
    setting,
    users,
    plugins
  }) => {
    let fs = require("fs"),
      perintah = m.text || "tags",
      tagCount = {},
      tagHelpMapping = {};
    let limitedCommands = {};
    let premiumCommands = {};
    Object.keys(plugins).filter(plugin => !plugin.disabled).forEach(plugin => {
      const tagsArray = Array.isArray(plugins[plugin].tags) ? plugins[plugin].tags : [];
      if (tagsArray.length > 0) {
        const helpArray = Array.isArray(plugins[plugin].help) ? plugins[plugin].help : [plugins[plugin].help];
        const isLimited = typeof plugins[plugin].limit !== "undefined" && plugins[plugin].limit > 0;
        const isPremium = plugins[plugin].premium === true;
        helpArray.forEach(cmd => {
          if (isLimited) limitedCommands[cmd] = true;
          if (isPremium) premiumCommands[cmd] = true;
        });
        tagsArray.forEach(tag => {
          if (tag) {
            if (tagCount[tag]) {
              tagCount[tag]++;
              tagHelpMapping[tag].push(...helpArray);
            } else {
              tagCount[tag] = 1;
              tagHelpMapping[tag] = [...helpArray];
            }
          }
        });
      }
    });
    let local_size = fs.existsSync("./database.json") ? await Func.getSize(fs.statSync("./database.json").size) : "N/A";
    let fitur = Object.values(plugins).filter(v => v.help).length;
    let message = setting.msg.replace("+tag", `@${m.sender.replace(/@.+/g, "")}`).replace("+greeting", Func.greeting()).replace("+uptime", Func.toDate(process.uptime() * 1e3)).replace("+mode", setting.group_mode ? "Group Only" : "Hybrid").replace("+db", /postgres/.test(config.DATABASE_STATE) ? "PostgreSQL" : `Local : ${local_size}`);
    const legend = "`Keterangan:` Ⓛ︎ = Limit | Ⓟ = Premium";
    const formatList = (items, prefix = "") => {
      const lines = items.split("\n").filter(line => line.trim() !== "");
      return lines.map((line, index) => {
        if (index === lines.length - 1) {
          return `${prefix}  └ ${line.trim().replace(/^├\s*/, "").replace(/^└\s*/, "")}`;
        } else {
          return `${prefix}  ├ ${line.trim().replace(/^├\s*/, "").replace(/^└\s*/, "")}`;
        }
      }).join("\n");
    };
    const formatCommand = cmd => {
      let formattedCmd = cmd;
      let badges = [];
      const cleanCmd = cmd.startsWith(m.prefix) ? cmd.substring(m.prefix.length) : cmd;
      if (limitedCommands[cleanCmd]) {
        badges.push("Ⓛ︎");
      }
      if (premiumCommands[cleanCmd]) {
        badges.push("Ⓟ");
      }
      if (badges.length > 0) {
        formattedCmd += ` [${badges.join("")}]`;
      }
      return formattedCmd;
    };
    if (perintah === "tags") {
      const daftarTag = Object.keys(tagCount).sort().map(tag => `${m.prefix + m.command} ${tag}`).join("\n");
      const formattedDaftarTag = formatList(daftarTag, "  ");
      const allMenuCommand = `${m.prefix + m.command} all`;
      const listContent = `
╭─「 🌐 *MENU UTAMA* 🌐 」
│ ${message}
│
│ *—[ KATEGORI PERINTAH ]—*
│
${formatList(`All Commands\n${daftarTag}`, "  ")}
│
│ ${legend}
╰─「 ✨ *INFO PENTING* ✨ 」
`.trim();
      if (setting.style === 1) {
        m.reply({
          image: {
            url: setting.cover
          },
          caption: listContent,
          contextInfo: {
            mentionedJid: [m.sender]
          },
          footer: config.FOOTER,
          buttons: [{
            buttonId: `${m.prefix}faq`,
            buttonText: {
              displayText: "— FAQ —"
            }
          }, {
            buttonId: allMenuCommand,
            buttonText: {
              displayText: "— SEMUA FITUR —"
            }
          }],
          viewOnce: true,
          headerType: 1
        });
      } else if (setting.style === 2) {
        m.reply(listContent);
      } else {
        m.reply({
          text: listContent,
          contextInfo: {
            mentionedJid: Func.parseMention(listContent),
            externalAdReply: {
              title: `YOSHIDA TECH ${require(process.cwd() + "/package.json").version}`,
              body: "Bots make things easier for you with existing features",
              thumbnailUrl: setting.cover,
              sourceUrl: "",
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });
      }
    } else if (tagCount[perintah]) {
      const daftarHelp = tagHelpMapping[perintah].sort().map(helpItem => formatCommand(m.prefix + helpItem)).join("\n");
      const formattedDaftarHelp = formatList(daftarHelp, "  ");
      const messages = `
╭─「 📚 *${perintah.toUpperCase()} COMMANDS* 📚 」
│
${formattedDaftarHelp}
│
│ ${legend}
╰─「 📋 *DAFTAR LENGKAP* 📋 」
`.trim();
      if (setting.style === 1) {
        m.reply({
          text: messages,
          contextInfo: {
            mentionedJid: Func.parseMention(messages)
          },
          footer: config.FOOTER,
          buttons: [{
            buttonId: `${m.prefix}menu`,
            buttonText: {
              displayText: "— KEMBALI KE MENU —"
            }
          }],
          viewOnce: true,
          headerType: 1
        });
      } else if (setting.style === 2) {
        m.reply(messages);
      } else {
        m.reply({
          text: messages,
          contextInfo: {
            mentionedJid: Func.parseMention(messages),
            externalAdReply: {
              title: `YOSHIDA TECH ${require(process.cwd() + "/package.json").version}`,
              body: "Artificial Intelligence, The beginning of robot era",
              thumbnailUrl: setting.cover,
              sourceUrl: "",
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });
      }
    } else if (perintah === "all") {
      const allTagsAndHelp = Object.keys(tagCount).sort().map(tag => {
        const daftarHelp = tagHelpMapping[tag].sort().map(helpItem => formatCommand(m.prefix + helpItem)).join("\n");
        const filteredDaftarHelp = daftarHelp.split("\n").filter(line => line.trim() !== "").join("\n");
        const formattedHelp = formatList(filteredDaftarHelp, "  ");
        return `╭───「 📦 *${tag.toUpperCase()}* 」\n${formattedHelp}\n╰───────────────`;
      }).join("\n\n");
      const kabeh = `
╭─「 🌟 *SEMUA PERINTAH* 🌟 」
│
│ *Halo* @${m.sender.replace(/@.+/g, "")} 🙌🏻
│ Ini adalah daftar lengkap fitur yang tersedia.
│ Total Perintah: *${fitur}*
│
${allTagsAndHelp}
│
│ ${legend}
╰─「 🚀 *MULAI EKSPLORASI* 🚀 」
`.trim();
      if (setting.style === 1) {
        m.reply({
          text: kabeh,
          contextInfo: {
            mentionedJid: [m.sender]
          },
          footer: config.FOOTER,
          buttons: [{
            buttonId: `${m.prefix}menu`,
            buttonText: {
              displayText: "— KEMBALI KE MENU —"
            }
          }],
          viewOnce: true,
          headerType: 1
        });
      } else if (setting.style === 2) {
        m.reply(kabeh);
      } else {
        m.reply({
          text: kabeh,
          contextInfo: {
            mentionedJid: Func.parseMention(kabeh),
            externalAdReply: {
              title: `YOSHIDA TECH ${require(process.cwd() + "/package.json").version}`,
              body: "Artificial Intelligence, The beginning of robot era",
              thumbnailUrl: setting.cover,
              sourceUrl: "",
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        });
      }
    } else {
      m.reply(`\n╭─[ ❌ PERINTAH TIDAK DITEMUKAN ❌ ]\n│\n│ Perintah ${m.prefix + m.command} ${perintah}\n│ Tidak Terdaftar Di Menu!\n│\n╰─[ ⚠️ MOHON CEK KEMBALI ⚠️ ]\n`.trim());
    }
  }
};