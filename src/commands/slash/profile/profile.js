const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient.js");
const schema = require("../../../schemas/PlayerSchema.js");
// require embeds and buttons discord.js v14
const {
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const config = require("../../../config.js");
const { Font, RankCardBuilder } = require("canvacord");
Font.loadDefault();

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your profile information or the profile of another user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user you want to view the profile of.")
    ),

  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const subcommand = "view";
    const user = interaction.options.getUser("user") || interaction.user;
     if (subcommand === "view") {
      await interaction.deferReply();
      const player = await schema.findOne({ userId: user.id });
      if (!player) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Profile Information")
              .setDescription(
                "<:error:1229320037131882598> You or the target do not have an profile, please use `/start` to create an profile and start playing!"
              )
              .setColor(config.color.main)
              .setTimestamp(),
          ],
          ephemeral: true,
        });
      }

      const RankCard = new RankCardBuilder()
        .setDisplayName(player.username) // Big name
        .setUsername(`<${player.cultivation.realm}> ${player.cultivation.step} ${player.cultivation.stage}`) // Small name
        .setAvatar(user.displayAvatarURL({ format: "png", size: 1024 })) // user avatar
        .setCurrentXP(player.cultivation.experience) // current xp
        .setRequiredXP(player.cultivation.requiredExperience) // required xp
        // .setLevel(player.level) // user level
        .setOverlay(90) // overlay percentage. Overlay is a semi-transparent layer on top of the background
        .setBackground(
          "https://w0.peakpx.com/wallpaper/849/4/HD-wallpaper-minimal-blackgreen-material-led-light-simple-black-dark-green-design.jpg"
        ) // set background color or,
        .setStyles({
          level: {
            color: config.color.main,
          },
          xp: {
            color: config.color.main,
          },
          username: {
            color: config.color.main,
          },
          progressbar: {
            color: config.color.main,
          },
        });

      const image = await RankCard.build({
        format: "png",
      });

      return interaction.editReply({
        files: [new AttachmentBuilder().setName("profile.png").setFile(image)],
        ephemeral: false,
      });
    }
  },
};
