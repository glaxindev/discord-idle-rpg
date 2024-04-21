const {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
  } = require("discord.js");
  const ExtendedClient = require("../../../class/ExtendedClient.js");
  const schema = require("../../../schemas/PlayerSchema.js");
  // require embeds and buttons discord.js v14
  const {
    EmbedBuilder,
  } = require("discord.js");
  const config = require("../../../config.js");
  
  module.exports = {
    structure: new SlashCommandBuilder()
      .setName("start")
      .setDescription("Create an profile for the game."),
    /**
     * @param {ExtendedClient} client
     * @param {ChatInputCommandInteraction} interaction
     */
    run: async (client, interaction) => {
      const subcommand = "create";
      const user = interaction.user;
      if (subcommand === "create") {
        const player = await schema.findOne({ userId: user.id });
        if (player) {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setTitle("Profile Creation")
                .setDescription(
                  "<:error:1229320037131882598> You already have an profile, please use `/profile` to view your profile information."
                )
                .setColor(config.color.main)
                .setTimestamp(),
            ],
            ephemeral: true,
          });
        }
        await schema.create({
          userId: user.id,
          username: user.tag,
        });
  
        const arr = [
          `<:success:1229320625034629192> You have successfully created an profile!`,
          `<:black_arrow:1229396585956380715> Use \`/profile\` to view your profile information.`,
        ];
  
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Profile Creation")
              .setDescription(arr.join("\n"))
              .setColor(config.color.main)
              .setTimestamp(),
          ],
          ephemeral: false,
        });
      };
    },
  };
  