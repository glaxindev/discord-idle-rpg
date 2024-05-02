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
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  UserSelectMenuBuilder,
} = require("discord.js");
const config = require("../../../config.js");
const tileEmotes = require("../../../tileEmotes.js");
const moment = require("moment");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your profile or the profile of another user.")
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
    const user = interaction.options.getUser("user") || interaction.user;
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

    const type =
      player.trackings.userType.charAt(0).toUpperCase() +
      player.trackings.userType.slice(1);

    // if power is in thousands, add a K at the end
    const power =
      player.powerlevel >= 1000
        ? `${(player.powerlevel / 1000).toFixed(1)}k`
        : player.powerlevel;

    // if money is in thousands, add a K at the end, or M for millions
    const money =
      player.money >= 1000000
        ? `${(player.money / 1000000).toFixed(1)}m`
        : player.money >= 1000
        ? `${(player.money / 1000).toFixed(1)}k`
        : player.money;

    const emote = await tileEmotes(user.id);

    const arr = [
      `__**${
        user.displayName.toUpperCase() || user.username.toUpperCase()
      }** (ID: ${player.trackings.playerNumber})__\n`,
      `**Type:** \`${type}\` | **Sect:** \`None\``,
      `**Alignment:** \`None\` | **Power:** \`${power}\``,
      `*"There is but one sky."*`,
      `${emote} (Badge Emotes)\n`,
      `**Partner:** \`None\` | **Title:** \`None\``,
      `**Cultivation:** \`${player.cultivation.step} ${player.cultivation.stage}\``,
      `**Currency:** Coin: \`${money}\` | **Jade:** \`0\`\n`,
      `**Stats:**`,
      `STR: \`${player.stats.strength}\` | AGI: \`${player.stats.agility}\` | END: \`${player.stats.endurance}\``,
      `FOR: \`${player.stats.fortune}\` | WIS: \`${player.stats.wisdom}\``,
    ];

    const embed = new EmbedBuilder()
      .setTitle("Cultivator Overview")
      .setDescription(arr.join("\n"))
      .setColor(user.accentColor ?? config.color.main)
      .setImage("attachment://profile.jpg")
      // .setTimestamp();
      .setFooter({
        text: `Started: ${moment(
          player.trackings.startedPlaying
        ).fromNow()} | Last Active: 1 second ago`,
        // iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
      });

    let row;
    let selectRow;
    if (user.id === interaction.user.id) {
      row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("fight")
          .setLabel("Fight")
          .setStyle(ButtonStyle.Danger)
          .setEmoji("👊"),
        new ButtonBuilder()
          .setCustomId("cultivation")
          .setLabel("Cultivate")
          .setStyle(ButtonStyle.Success)
          .setEmoji("🔨"),
        new ButtonBuilder()
          .setCustomId("inventory")
          .setLabel("Inventory")
          .setStyle(ButtonStyle.Primary)
          .setEmoji("🔎"),
        new ButtonBuilder()
          .setCustomId("invite")
          .setLabel("Invite")
          .setStyle(ButtonStyle.Success)
          .setDisabled(true)
          .setEmoji("🤖")
      );

      selectRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("additional")
          .setPlaceholder("Additional Options")
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Commands")
              .setValue("commands")
              .setDescription("View all available commands for this bot.")
              .setEmoji("📜")
          )
      );
    } else {
      row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("fight")
          .setLabel("Fight")
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true)
          .setEmoji("👊"),
        new ButtonBuilder()
          .setCustomId("cultivation")
          .setLabel("Cultivate")
          .setStyle(ButtonStyle.Success)
          .setDisabled(true)
          .setEmoji("🔨"),
        new ButtonBuilder()
          .setCustomId("inventory")
          .setLabel("Inventory")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true)
          .setEmoji("🔎"),
        new ButtonBuilder()
          .setCustomId("invite")
          .setLabel("Invite")
          .setStyle(ButtonStyle.Success)
          .setDisabled(true)
          .setEmoji("🤖")
      );
      selectRow = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("additional")
          .setPlaceholder("Additional Options")
          .setDisabled(true)
          .addOptions(
            new StringSelectMenuOptionBuilder()
              .setLabel("Commands")
              .setValue("commands")
              .setDescription("View all available commands for this bot.")
              .setEmoji("📜")
          )
      );
    }

    await interaction.editReply({
      embeds: [embed],
      files: [
        new AttachmentBuilder()
          .setName("profile.jpg")
          .setFile(`./assets/profile.jpg`),
      ],
      components: [row, selectRow],
      ephemeral: false,
    });

    const filter = (i) =>
      i.user.id === interaction.user.id &&
      i.guildId === interaction.guildId &&
      i.message.interaction.id === interaction.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "fight") {
        await i.deferUpdate();

        const selectUsers = new UserSelectMenuBuilder()
          .setCustomId("fight_user")
          .setPlaceholder("Select a user to fight with.")
          .setMinValues(1)
          .setMaxValues(1);

        const selectUsersRow = new ActionRowBuilder().addComponents(
          selectUsers
        );

        await i.editReply({
          content: "**Select a player to challenge:**",
          embeds: [],
          components: [selectUsersRow],
          files: [],
        });

        client.on("interactionCreate", async (i2) => {
          if (!i2.customId === "fight_user") return;
          await i2.deferUpdate();
          const target = i2.values[0];
          const targetPlayer = await schema.findOne({ userId: target });

          if (!targetPlayer) {
            return await i2.editReply({
              content: "The target player does not have a profile.",
              components: [],
              embeds: [],
              files: [],
            });
          }

          if (targetPlayer.userId === i2.user.id) {
            return await i2.editReply({
              content: "You cannot fight with yourself :)",
              components: [],
              embeds: [],
              files: [],
            });
          }

          if (targetPlayer.coordinates.x !== player.coordinates.x) {
            return await i2.editReply({
              content:
                "You can only fight with players in the same area as you.",
              components: [],
              embeds: [],
              files: [],
            });
          }

          if (targetPlayer.coordinates.y !== player.coordinates.y) {
            return await i2.editReply({
              content:
                "You can only fight with players in the same area as you.",
              components: [],
              embeds: [],
              files: [],
            });
          }

          if (targetPlayer.coordinates.z !== player.coordinates.z) {
            return await i2.editReply({
              content:
                "You can only fight with players in the same area as you.",
              components: [],
              embeds: [],
              files: [],
            });
          }

          if (targetPlayer.coordinates.zy !== player.coordinates.zy) {
            return await i2.editReply({
              content:
                "You can only fight with players in the same area as you.",
              components: [],
              embeds: [],
              files: [],
            });
          }

          let challenger = player;
          let challenged = targetPlayer;

          if (!challenger.powerlevel >= 200) {
            return i2.editReply({
              content:
                "You need a power of 200 to challenge someone to a battle!",
              embeds: [],
              components: [],
              files: [],
            });
          }

          if (!challenger.stats.strength >= 10) {
            return i2.editReply({
              content:
                "You need a strength of 10 to challenge someone to a battle!",
              embeds: [],
              components: [],
              files: [],
            });
          }

          let winner;
          if (
            challenger.equippedTechniques.find(
              (technique) => technique.uid === "6"
            )
          ) {
            winner = challenger;
            challenger.equippedTechniques.find(
              (technique) => technique.uid === "6"
            ).proficiency += 0.02;
            await challenger.save();
          } else {
            winner = challenged;
          }

          if (
            challenger.equippedTechniques.find(
              (technique) => technique.uid === "2"
            )
          ) {
            winner = challenger;
            if (challenger.stats.strength >= 5) {
              challenger.stats.strength -= 5;
            }
            challenger.equippedTechniques.find(
              (technique) => technique.uid === "2"
            ).proficiency += 0.02;
            await challenger.save();
          } else {
            winner = challenged;
          }

          if (challenger.stats.strength >= 5) {
            winner = challenger;
            challenger.stats.strength -= 5;
            await challenger.save();
          } else {
            winner = challenged;
          }

          if (challenger.equippedTechniques.find((tech) => tech.uid === "5")) {
            challenger.stats.strength += 5;
            await challenger.save();
          }

          if (challenger.equippedTechniques.find((tech) => tech.uid === "1")) {
            challenger.stats.agility += 5;
            challenger.stats.strength -= 5;
            await challenger.save();
          }

          if (challenger.stats.wisdom >= 5) {
            winner = challenger;
            challenger.stats.wisdom -= 5;
            await challenger.save();
          } else {
            winner = challenged;
          }

          const embed1 = new EmbedBuilder()
            .setTitle("Battle Challenge")
            .setDescription(`You have challenged ${user.username} to a battle!`)
            .setColor(config.color.main)
            .setTimestamp();

          await i2.editReply({
            embeds: [embed1],
            content: null,
            components: [],
            files: [],
          });

          setTimeout(() => {
            const arr = [
              `<:black_arrow:1229396585956380715> **${challenger.username}** vs **${challenged.username}**\n`,
            ];

            const embed = new EmbedBuilder()
              .setTitle("Battle Challenge")
              .setDescription(arr.join("\n"))
              .setColor(config.color.main)
              .setTimestamp();
            i2.editReply({ embeds: [embed] });

            arr.push(`<:battle:1231202621897838723> Strength Analyzed`);
            embed.setDescription(arr.join("\n"));
            i2.editReply({ embeds: [embed] });
            setTimeout(() => {
              arr.push(`<:battle:1231202621897838723> Skills Used`);
              embed.setDescription(arr.join("\n"));
              i.editReply({ embeds: [embed] });
            }, 1000);
            setTimeout(() => {
              arr.push(`<:battle:1231202621897838723> Battle Started`);
              embed.setDescription(arr.join("\n"));
              i2.editReply({ embeds: [embed] });
            }, 2000);
            setTimeout(() => {
              arr.push(`<:battle:1231202621897838723> Battle Ended`);
              embed.setDescription(arr.join("\n"));
              i2.editReply({ embeds: [embed] });
            }, 5000);
          }, 2000);

          setTimeout(() => {
            const embed2 = new EmbedBuilder()
              .setTitle("Challenge")
              .setDescription(
                `<:black_arrow:1229396585956380715> **${
                  winner.userId === challenger.userId
                    ? challenger.username
                    : challenged.username
                }** has won the battle and there was no penalty or reward.`
              )
              .setColor(config.color.main)
              .setTimestamp();
              // collector.stop();
            return i2.editReply({ embeds: [embed2] });
          }, 10000);
        });
      } else if (i.customId === "cultivation") {
        await i.deferUpdate();
        await i.channel.send({
          content:
            "You can cultivate to gain experience using the `/cultivate` command.",
          components: [],
          files: [],
          ephemeral: true,
        });
      } else if (i.customId === "inventory") {
        await i.deferUpdate();
        await i.channel.send({
          content:
            "You can view your inventory using the `/inventory` command.",
          components: [],
          files: [],
          ephemeral: true,
        });
      } else if (i.customId === "invite") {
        // soon
        await i.deferUpdate();
      } else if (i.customId === "additional") {
        if (i.values[0] === "commands") {
          await i.deferUpdate();
          await i.channel.send({
            content:
              "You can view all available commands using the `/commands` command.",
            components: [],
            files: [],
            ephemeral: true,
          });
        }
      }
    });

    collector.on("end", () => {
      interaction.editReply({
        embeds: [embed],
        files: [
          new AttachmentBuilder()
            .setName("profile.jpg")
            .setFile(`./assets/profile.jpg`),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            row.components.map((c) => c.setDisabled(true))
          ),
          new ActionRowBuilder().addComponents(
            selectRow.components.map((c) => c.setDisabled(true))
          ),
        ],
        ephemeral: false,
      });
    });
  },
};
