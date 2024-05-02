const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  AttachmentBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient.js");
const config = require("../../../config.js");
const { itemTypes } = config;
let allEvents = require("../../../journeyevents.js");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("journey")
    .setDescription(
      "Go on a journey and encounter various events along the way!"
    ),
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const Player = require("../../../schemas/PlayerSchema.js");

    const playerid = Player.findOne({ userId: interaction.user.id });
    if (!playerid) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription(
              "<:error:1229320037131882598> You do not have a profile, please use `/start` to create a profile and start playing!"
            )
            .setColor(config.color.main)
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    let eventTypes = [
      "Exploration",
      "Gathering",
      "Sparring",
      "Training",
      "Combat",
    ];

    // Function to generate a random item

    const member = await Player.findOne({ userId: interaction.user.id });

    if (member.cultivation.experience >= 50) {
      allEvents = allEvents.filter(
        (event) =>
          event.eventType === "Exploration" ||
          event.eventType === "Gathering" ||
          event.eventType === "Sparring"
      );
    } else if (member.cultivation.experience >= 100) {
      allEvents = allEvents.filter(
        (event) =>
          event.eventType === "Exploration" ||
          event.eventType === "Gathering" ||
          event.eventType === "Sparring" ||
          event.eventType === "Training" ||
          event.eventType === "Combat"
      );
    } else if (member.cultivation.experience <= 10) {
      allEvents = allEvents.filter(
        (event) =>
          event.eventType === "Exploration" || event.eventType === "Gathering"
      );
    } else {
      allEvents = allEvents.filter(
        (event) => event.eventType === "Exploration"
      );
    }

    const chanceForEvents = Math.random();
    if (chanceForEvents > 0.4) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Journey")
            .setDescription(
              "<:black_arrow:1229396585956380715> You have encountered no events on your journey, keep moving!"
            )
            .setColor(config.color.main),
        ],
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("move")
              .setLabel("Move")
              .setStyle(ButtonStyle.Primary)
          ),
        ],
        ephemeral: false,
      });
    };

    if (member.coordinates.x === 0 && member.coordinates.y < 4 || member.coordinates.x < 2 && member.coordinates.y > 2) {
      if (member.stats.strength < 10) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Journey")
              .setDescription(
                "<:black_arrow:1229396585956380715> You have encountered a wild beast on your journey, you need to have a strength of 10 to defeat it!"
              )
              .setColor(config.color.main),
          ],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId("move")
                .setLabel("Move")
                .setStyle(ButtonStyle.Primary)
            ),
          ],
          ephemeral: false,
        });
      }
    };

    const generateRandomItem = () => {
      // pick a random item via odds for each rarity
      const random = Math.random();
      let rarity;

      if (member.cultivation.experience >= 50) {
        if (random < 0.8) rarity = "Legendary";
        else if (random < 0.9) rarity = "Rare";
        else rarity = "Common";
      } else if (member.cultivation.experience >= 100) {
        if (random < 0.1) rarity = "Mystical";
        else if (random < 0.3) rarity = "Celestial";
        else if (random < 0.5) rarity = "Divine";
        else if (random < 0.6) rarity = "Mythical";
        else if (random < 0.8) rarity = "Legendary";
        else if (random < 0.9) rarity = "Rare";
        else rarity = "Common";
      } else if (member.cultivation.experience <= 10) {
        if (random < 0.9) rarity = "Rare";
        else rarity = "Common";
      } else {
        if (random < 0.8) rarity = "Legendary";
        else if (random < 0.9) rarity = "Rare";
        else rarity = "Common";
      }

      // filter items by rarity
      const filteredItems = itemTypes.filter((item) => item.rarity === rarity);
      // pick a random item from the filtered list
      const randomIndex = Math.floor(Math.random() * filteredItems.length);
      return filteredItems[randomIndex];
    };

    if (!member) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("Error")
            .setDescription(
              "<:error:1229320037131882598> You do not have a profile, please use `/start` to create a profile and start playing!"
            )
            .setColor(config.color.main)
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }

    // choose a random event from the events array
    const event = allEvents[Math.floor(Math.random() * allEvents.length)];

    const arrDescription = [
      `<:black_arrow:1229396585956380715> **${event.description}** [${event.eventType}]\n`,
      `<:black_arrow:1229396585956380715> **1.** ${event.options[0]} [${event.consequences[0].xpChange} xp]\n`,
      `<:black_arrow:1229396585956380715> **2.** ${event.options[1]} [${event.consequences[1].xpChange} xp]`,
    ];

    const eventEmbed = new EmbedBuilder()
      .setTitle("Journey")
      .setDescription(arrDescription.join("\n"))
      .setColor(config.color.main)
      .setFooter({
        text: "Xianxia RPG V1.0.0 | Choose wisely!",
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("option1")
        .setLabel(`1`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("option2")
        .setLabel(`2`)
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      embeds: [eventEmbed],
      components: [row],
    });

    const filter = (i) =>
      i.user.id === interaction.user.id && i.guild.id === interaction.guild.id;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.customId === "option1") {
        const choice = 0;
        const consequence = event.consequences[choice];

        const player = await Player.findOne({ userId: interaction.user.id });
        // if (!player) return console.error('Player not found.');

        if (
          !player.cultivation.experience >=
          player.cultivation.requiredExperience
        ) {
          player.cultivation.experience += consequence.xpChange;
        }

        const newItem = generateRandomItem();

        // generate a random technique from config.techniques and give it to player if he doesn't have it

        const generateRandomTechnique = () => {
          // 2% chance to get a technique
          if (Math.random() < 0.01) {
            const randomIndex = Math.floor(
              Math.random() * config.techniques.length
            );
            return config.techniques[randomIndex];
          } else {
            return null;
          }
        };

        const newTechnique = generateRandomTechnique();

        if (
          newTechnique !== null &&
          !player.techniques.some(
            (technique) => technique.name === newTechnique.name
          )
        ) {
          player.techniques.push(newTechnique);
        }

        // if player has this item already, then increase the quantity

        if (player.inventory.some((item) => item.name === newItem.name)) {
          player.inventory.find(
            (item) => item.name === newItem.name
          ).quantity += 1;
          player.markModified("inventory");
        } else {
          player.inventory.push(newItem);
          player.markModified("inventory");
        }

        // Apply alignment change and other consequences

        await player.save();

        const gotTechniqueOrItem = newTechnique
          ? `a **${newTechnique.name}** technique`
          : `a **${newItem.rarity} ${newItem.name}**`;

        const repeatButton = new ButtonBuilder()
          .setCustomId("repeat")
          .setLabel("Repeat")
          .setEmoji("🔁")
          .setStyle(ButtonStyle.Success);

        const moveButton = new ButtonBuilder()
          .setCustomId("move")
          .setLabel("Move")
          // .setEmoji('➡️')
          .setStyle(ButtonStyle.Primary);

        const repeatRow = new ActionRowBuilder().addComponents(
          repeatButton,
          moveButton
        );

        try {
          await i.deferUpdate();
        } catch {};

        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Journey")
              .setDescription(
                `<:black_arrow:1229396585956380715> You have chosen to **${event.options[choice]}** and got ${consequence.xpChange} xp and ${gotTechniqueOrItem}!}`
              )
              .setColor(config.color.main)
              .setImage("attachment://grid.png")
              .setTimestamp(),
          ],
          components: [repeatRow],
          files: [new AttachmentBuilder(`${process.cwd()}/assets/grid.png`)],
        });
        // await i.deferUpdate();
      } else if (i.customId === "option2") {
        const choice = 1;
        const consequence = event.consequences[choice];

        const player = await Player.findOne({ userId: interaction.user.id });
        // if (!player) return console.error('Player not found.');

        if (
          !player.cultivation.experience >=
          player.cultivation.requiredExperience
        ) {
          player.cultivation.experience += consequence.xpChange;
        }

        const newItem = generateRandomItem();
        // player.inventory.push(newItem);
        if (player.inventory.some((item) => item.name === newItem.name)) {
          player.inventory.find(
            (item) => item.name === newItem.name
          ).quantity += 1;
          player.markModified("inventory");
        } else {
          player.inventory.push(newItem);
          player.markModified("inventory");
        }
        // Apply alignment change and other consequences
        await player.save();

        const repeatButton = new ButtonBuilder()
          .setCustomId("repeat")
          .setLabel("Repeat")
          .setStyle(ButtonStyle.Success)
          .setEmoji("🔁");

        const moveButton = new ButtonBuilder()
          .setCustomId("move")
          .setLabel("Move")
          // .setEmoji('➡️')
          .setStyle(ButtonStyle.Primary);

        const repeatRow = new ActionRowBuilder().addComponents(
          repeatButton,
          moveButton
        );

        try {
          await i.deferUpdate();
        } catch {};

        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Journey")
              .setDescription(
                `<:black_arrow:1229396585956380715> You have chosen to **${event.options[choice]}** and got a **${newItem.rarity} ${newItem.name}**!`
              )
              .setColor(config.color.main)
              .setImage(`attachment://grid.png`)
              .setTimestamp(),
          ],
          components: [repeatRow],
          files: [new AttachmentBuilder(`${process.cwd()}/assets/grid.png`)],
        });
        // await i.deferUpdate();
      } else if (i.customId === "move") {
        await i.deferUpdate();

        const player = await Player.findOne({ userId: interaction.user.id });

         const arrD = [
                `**Please use the buttons below to move to the desired coordinates.** \n`,
                `Current Location: ${player.location}`,
            ];                                    

        const embed = new EmbedBuilder()
          .setTitle("Movement")
          .setDescription(
            arrD.join("\n")
          )
          .setColor(config.color.main)
          .addFields({
            name: "Coordinates",
            value: `(${player.coordinates.x},${player.coordinates.y},${player.coordinates.z},${player.coordinates.zy})`,
          });

        const actionRow = new ActionRowBuilder().addComponents(
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

        let msg = await i.channel
          .send({
            embeds: [embed],
            components: [actionRow],
            files: [],
            ephemeral: true,
          })
          .catch(() => {});

        collector.stop();
        interaction.deleteReply();

        collector.removeListener("collect", () => {});

        const filter2 = (i2) => i2.user.id === interaction.user.id;
        const collector2 = interaction.channel.createMessageComponentCollector({
          filter2,
          time: 60000,
        });

        collector2.on("collect", async (i2) => {
          try {
            await i2.deferUpdate();
          } catch {};
          if (i2.customId === "left") {
            player.coordinates.x -= 1;
            player.coordinates.zy -= 1;
          } else if (i2.customId === "up") {
            player.coordinates.y += 1;
          } else if (i2.customId === "down") {
            player.coordinates.y -= 1;
          } else if (i2.customId === "right") {
            player.coordinates.x += 1;
            player.coordinates.zy += 1;
          }

          await player.save();

          const arrD2 = [
                `**Please use the buttons below to move to the desired coordinates.** \n`,
                `Current Location: ${player.location}`,
            ];

          const embed = new EmbedBuilder()
            .setTitle("Movement")
            .setDescription(
              arrD2.join("\n")
            )
            .setColor(config.color.main)
            .addFields({
              name: "Coordinates",
              value: `(${player.coordinates.x},${player.coordinates.y},${player.coordinates.z},${player.coordinates.zy})`,
            });

          await msg.edit({
            embeds: [embed],
            components: [actionRow],
          });

          collector2.resetTimer();
        });

        collector2.on("end", async () => {
          return msg.edit({
            embeds: [embed],
            components: [
              new ActionRowBuilder().addComponents(
                actionRow.components.map((component) =>
                  component.setDisabled(true)
                )
              ),
            ],
          });
        });
      }
    });

    client.on("interactionCreate", async (i) => {
      if (!i.isButton()) return;
      if (i.user.id !== interaction.user.id) return;
      if (i.customId === "repeat") {
        await collector.stop();
        return client.collection.interactioncommands
          .get("journey")
          .run(client, i);
      }
    });
  },
};
