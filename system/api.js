const APIs = {
  wudysoft: "https://wudysoft.xyz",
  yosh: "https://api.yoshida.my.id",
  gratis: "https://api.apigratis.tech"
};
const APIKeys = {
  "": ""
};
module.exports = API = (name, path = "/", query = {}, apikeyqueryname) => (name in APIs ? APIs[name] : name) + path + (query || apikeyqueryname ? "?" + new URLSearchParams(Object.entries({
  ...query,
  ...apikeyqueryname ? {
    [apikeyqueryname]: APIKeys[name in APIs ? APIs[name] : name]
  } : {}
})) : "");