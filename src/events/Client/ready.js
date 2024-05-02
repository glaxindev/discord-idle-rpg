const { log } = require("../../functions");
const ExtendedClient = require("../../class/ExtendedClient");
const { ActivityType } = require("discord.js");

module.exports = {
  event: "ready",
  once: true,
  /**
   *
   * @param {ExtendedClient} _
   * @param {import('discord.js').Client<true>} client
   * @returns
   */
  run: async (_, client) => {
    const Player = require("../../schemas/PlayerSchema.js");

    log("Logged in as: " + client.user.tag, "done");

    // setTimeout(() => {
    //   // console.clear();
    //   log("Running optimizations for Discord.js Bot!", 'extra');
    // }, 3000);

    // Set bot status to "idle" with the number of servers it is in
    client.user.setPresence({
      status: "idle",
      activities: [
        {
          name: `${client.guilds.cache.size} servers`,
          type: ActivityType.Watching,
        },
      ],
    });

    // give user 1 cultivation experience every 20 seconds
    async function incrementCultivation() {
      try {
        const users = await Player.find();
        for (const user of users) {
          if (!user.cultivation.experience >= user.cultivation.requiredExperience) {
            user.cultivation.experience += 1;
            await user.save();
            console.log("Cultivation experience incremented for all users.");
          } else return;
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Schedule cultivation experience increment every 20 seconds
    setInterval(
      incrementCultivation,
      20000
    );

    // power formula

    async function powerFormula() {
      try {
        const users = await Player.find();
        for (const user of users) {
          
          // calculate power level using player stats and items and techniques
          const powerLevel =
            user.stats.strength +
            user.stats.agility +
            user.stats.endurance +
            user.stats.wisdom +
            user.stats.fortune +
            user.inventory.length +
            user.techniques.length +
            user.cultivation.experience;

          if (user.powerlevel !== powerLevel) {
            user.powerlevel = powerLevel;
            await user.save();
            console.log("Power level calculated for all users.");
          } else return;
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Schedule power level calculation every 1 hour
    setInterval(
      powerFormula,
      20000
    );

    const WorldSchema = require("../../schemas/WorldSchema.js");
    // find the world document
    const world = await WorldSchema.findOne();
    if (!world) {
      await WorldSchema.create({});
    };

    let locationArray = [
      "Mountain",
      "Forest",
      "Desert",
      "Cave",
      "River",
      "Beach",
      "Village",
      "Castle",
      "Town",
      "City",
    ];

    let timeArray = [
      "Morning",
      "Afternoon",
      "Evening",
      "Night",
    ];

    let weatherArray = [
      "Sunny",
      "Rainy",
      "Cloudy",
      "Snowy",
    ];

    // set random time and weather for each location every 3 hours
    async function randomTimeWeather() {
      try {
        const world = await WorldSchema.findOne();
        for (const location of locationArray) {
          world.locations[location.toLowerCase()].time = timeArray[Math.floor(Math.random() * timeArray.length)];
          world.locations[location.toLowerCase()].weather = weatherArray[Math.floor(Math.random() * weatherArray.length)];
          await world.save();
        }
        console.log("Random time and weather set for all locations.");
      } catch (error) {
        console.error(error);
      }
    };

    // change every player location randomly every 3 hours
    async function randomLocation() {
      try {
        const users = await Player.find();
        for (const user of users) {
          user.location = locationArray[Math.floor(Math.random() * locationArray.length)];
          await user.save();
        }
        console.log("Random location set for all users.");
      } catch (error) {
        console.error(error);
      }
    };

    // Schedule random time and weather every 3 hours
    setInterval(
      randomTimeWeather,
      10800000
    );

    // Schedule random location every 3 hours
    setInterval(
      randomLocation,
      10800000
    );
  },
};
