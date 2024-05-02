const { ChatInputCommandInteraction, SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const schema = require('../../../schemas/PlayerSchema.js');
const config = require('../../../config.js');
const { Font, LeaderboardBuilder } = require('canvacord');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows you top 10 players on the leaderboard.'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        try {
            if (!interaction.deferred) {
                await interaction.deferReply();
            }
        } catch (error) {
            console.log("Failed to defer reply in leaderboard command.")
        };

        const players = await schema.find({}).sort({ 'player.powerlevel': -1 }).limit(10);

        function rankPlayers(players) {

            // remove test players userType from the list
            players = players.filter(player => player.trackings.userType !== 'test');

            return players.sort((a, b) => {
                const steps = ['Entry', 'Early', 'Middle', 'Late', 'Peak', 'Lesser Perfection', 'Greater Perfection', 'Extreme Perfection'];
                const stages = ['Qi Sensing', 'Body Strengthening', 'Qi Condensation', 'Foundation Establishment', 'Core Formation'];
                const realms = ['Mortal', 'Warrior', 'Saint', 'Immortal', 'Sage', 'Celestial', 'Divine'];

                // If exp are equal, compare based on cultivation realm
                if (realms.indexOf(a.cultivation.realm) > realms.indexOf(b.cultivation.realm)) return -1;
                if (realms.indexOf(a.cultivation.realm) < realms.indexOf(b.cultivation.realm)) return 1;

                // If realms are equal, compare based on cultivation stage
                if (stages.indexOf(a.cultivation.stage) > stages.indexOf(b.cultivation.stage)) return -1;
                if (stages.indexOf(a.cultivation.stage) < stages.indexOf(b.cultivation.stage)) return 1;

                // If stages are equal, compare based on cultivation step
                if (steps.indexOf(a.cultivation.step) > steps.indexOf(b.cultivation.step)) return -1;
                if (steps.indexOf(a.cultivation.step) < steps.indexOf(b.cultivation.step)) return 1;

                if (a.powerLevel > b.powerLevel) return -1;
                if (a.powerLevel < b.powerLevel) return 1;

                if (a.cultivation.experience > b.cultivation.experience) return -1;
                if (a.cultivation.experience < b.cultivation.experience) return 1;

                // If all comparisons are equal, return 0
                return 0;
            });
        };

        const rankedPlayers = rankPlayers(players);

          // map players to array based on thier current stats and power level and cultivation steps and etc.
          const playersArray = rankedPlayers.map((player, index) => {
            return {
                avatar: client.users.cache.get(player.userId)?.displayAvatarURL({ format: 'png' }),
                username: client.users.cache.get(player.userId)?.username,
                displayName: client.users.cache.get(player.userId)?.displayName,
                level: player.cultivation.realm,
                xp: player.cultivation.experience,
                // rank should be based on thier power level or cultivation steps or etc.
                rank: rankPlayers(players).indexOf(player) + 1,
            };
        });

        // load font
Font.loadDefault();

// generate image
const lb = new LeaderboardBuilder()
  // set title, image and subtitle
  .setHeader({
    title: "Leaderboard",
    image: client.user.displayAvatarURL({ format: "png" }),
    subtitle: "Top 10 Players",
  })
  // set players, usually you would get this from a database but for this example we will hardcode it
  .setPlayers(playersArray)
  .setBackground(`${process.cwd()}/assets/bg.jpg`);

lb.setVariant("default");

const image = await lb.build({ format: "png" });

        interaction.editReply({
            files: [
                new AttachmentBuilder()
                    .setFile(image)
                    .setName('leaderboard.png')
                    .setSpoiler(false)
            ]
        });

    }
};