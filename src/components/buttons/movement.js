const { ButtonInteraction, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const ExtendedClient = require("../../class/ExtendedClient.js");
const Player = require('../../schemas/PlayerSchema.js');
const config = require('../../config.js');

module.exports = {
  customId: "move_old",
  /**
   *
   * @param {ExtendedClient} client
   * @param {ButtonInteraction} interaction
   */
  run: async (client, interaction) => {
    if (interaction.user.id !== interaction.message.interaction.user.id) return;

    const player = await Player.findOne({ userId: interaction.user.id });

    const embed = new EmbedBuilder()
      .setTitle("Movement")
      .setDescription(
        "Please use the buttons below to move to the desired coordinates."
      )
      .setColor(config.color.main)
      .addFields({
        name: "Coordinates",
        value: `(${player.coordinates.x},${player.coordinates.y},${player.coordinates.z},${player.coordinates.zy})`,
      });

    const actionRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId("left")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("<:left:1235449810849497130>"),
            new ButtonBuilder()
            .setCustomId("up")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("<:WhiteUp:1235450108527644743>"),
            new ButtonBuilder()
            .setCustomId("down")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("<:WhiteDown:1235450176819167293>"),
            new ButtonBuilder()
            .setCustomId("right")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("<:rightarrow:1235449899965874196>")
        );

    await interaction.reply({
      embeds: [embed],
      components: [actionRow],
      ephemeral: true,
    });

    const filter = (i) => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "left") {
        player.coordinates.x -= 1;
        player.coordinates.zy -= 1;
      } else if (i.customId === "up") {
        player.coordinates.y += 1;
      } else if (i.customId === "down") {
        player.coordinates.y -= 1;
      } else if (i.customId === "right") {
        player.coordinates.x += 1;
        player.coordinates.zy += 1;
      };

      await player.save();

      const embed = new EmbedBuilder()
        .setTitle("Movement")
        .setDescription(
          "Please use the buttons below to move to the desired coordinates."
        )
        .setColor(config.color.main)
        .addFields({
          name: "Coordinates",
          value: `(${player.coordinates.x},${player.coordinates.y},${player.coordinates.z},${player.coordinates.zy})`,
        });

      await i.update({
        embeds: [embed],
        components: [actionRow],
      });

      collector.resetTimer();
    });

    collector.on("end", async () => {
      await interaction.editReply({
        embeds: [embed],
        components: [
            new ActionRowBuilder().addComponents(
                actionRow.components.map((component) => component.setDisabled(true))
            ),
        ],
      });
    });
  },
};
