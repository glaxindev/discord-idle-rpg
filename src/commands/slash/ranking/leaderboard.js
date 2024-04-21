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

        interaction.deferReply({ ephemeral: false });

        const players = await schema.find({}).sort({ level: -1 }).limit(10);

        function rankPlayers(players) {
            return players.sort((a, b) => {
                // Compare based on power level
                if (a.powerLevel > b.powerLevel) return -1;
                if (a.powerLevel < b.powerLevel) return 1;
        
                // If power level is the same, compare based on cultivation steps
                if (a.cultivation.steps > b.cultivation.steps) return -1;
                if (a.cultivation.steps < b.cultivation.steps) return 1;
                if (a.cultivation.stage > b.cultivation.stage) return -1;
                if (a.cultivation.stage < b.cultivation.stage) return 1;
                if (a.cultivation.realm > b.cultivation.realm) return -1;
                if (a.cultivation.realm < b.cultivation.realm) return 1;

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
                displayName: client.users.cache.get(player.userId)?.tag,
                level: player.level,
                xp: player.currentXp,
                // rank should be based on thier power level or cultivation steps or etc.
                rank: index + 1,
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
    subtitle: "Top 10",
  })
  // set players, usually you would get this from a database but for this example we will hardcode it
  .setPlayers(playersArray)
  .setBackground("https://w0.peakpx.com/wallpaper/849/4/HD-wallpaper-minimal-blackgreen-material-led-light-simple-black-dark-green-design.jpg");

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