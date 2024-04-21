const { log } = require("../../functions");
const ExtendedClient = require("../../class/ExtendedClient");

module.exports = {
  event: "ready",
  once: true,
  /**
   *
   * @param {ExtendedClient} _
   * @param {import('discord.js').Client<true>} client
   * @returns
   */
  run: (_, client) => {
    const Player = require("../../schemas/PlayerSchema.js");

    log("Logged in as: " + client.user.tag, "done");

    // Function to increment user powerxp every 6 hours for all users
    async function incrementPowerXP() {
      try {
        const users = await Player.find();
        for (const user of users) {
          user.powerlevel += 200;
          await user.save();
        }
        console.log("PowerXP incremented for all users.");
      } catch (error) {
        console.error(error);
      }
    };

    // Schedule powerxp increment every 6 hours
    setInterval(
      incrementPowerXP,
      21600000
    );

    // give user 1 cultivation experience every 20 seconds
    async function incrementCultivation() {
      try {
        const users = await Player.find();
        for (const user of users) {
          user.cultivation.experience += 1;
          await user.save();
        }
        console.log("Cultivation experience incremented for all users.");
      } catch (error) {
        console.error(error);
      }
    };

    // Schedule cultivation experience increment every 20 seconds
    setInterval(
      incrementCultivation,
      20000
    );

  },
};
