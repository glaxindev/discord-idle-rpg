async function tileEmotes(userId) {
  const schema = require("./schemas/PlayerSchema.js");

  const emotes = {
    1: "👼",
    2: "👹",
    3: "👻",
    4: "👽",
    5: "🤖",
    6: "👾",
    7: "🤡",
    8: "🐍",
    9: "🦄",
    10: "💀",
  };
  const player = await schema.findOne({ userId: userId });

  if (player.coordinates.zy > 0) return `${emotes[1]}`;
  if (player.coordinates.zy < 0) return `${emotes[2]}`;
  if (player.coordinates.zy > 10) return `${emotes[3]}`;
  if (player.coordinates.zy > 30) return `${emotes[4]}`;
  if (player.coordinates.zy > 50) return `${emotes[5]}`;
  if (player.coordinates.zy > 70) return `${emotes[6]}`;
  if (player.coordinates.zy > 90) return `${emotes[7]}`;
  if (player.coordinates.zy > 100) return `${emotes[8]}`;
  if (player.coordinates.zy > 150) return `${emotes[9]}`;
  if (player.coordinates.zy > 200) return `${emotes[10]}`;

  return "<:user:1234442888633651250>";
}

module.exports = tileEmotes;
