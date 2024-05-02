const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const schema = require("../../../schemas/PlayerSchema.js");
const config = require("../../../config.js");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows your inventory and the items you have."),
  options: {
    cooldown: 5000,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const player = await schema.findOne({ userId: interaction.user.id });
    if (!player)
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
    const inventory = player.inventory;
    const techniques = player.techniques;

    const arr = [`> **Your Items**`];

    if (inventory.length > 1) {
      const itemIndex = await inventory.map((item, index) => {
        // if item type is item then rename it to Usable
        const itemType = item.type === "item" ? "usable" : item.type;
        const itemTypeCapitalized =
          itemType.slice(0, 1).toUpperCase() + itemType.slice(1);
        arr.push(
          `<:black_arrow:1229396585956380715> **${index + 1}.** ${
            item.rarity
          } ${item.name} ${item.quantity}x (${itemTypeCapitalized}) ID: \`${
            item.uid
          }\``
        );
      });
      await techniques.map((technique, index) => {
        const newIndex = itemIndex.length + index + 1;
        arr.push(
          `<:black_arrow:1229396585956380715> **${newIndex}.** ${technique.name} (Technique | ${technique.stage} | \`${technique.proficiency}\`) ID: \`${technique.uid}\``
        );
      });
    } else {
      arr.push(`> You do not have any items in your inventory.`);
    }

    if (player.equippedItems.length > 0) {
      arr.push(`\n > **Equipped Items**`);
      const equippedItemsIndex = player.equippedItems.map((item, index) => {
        const itemType = item.type === "item" ? "usable" : item.type;
        const itemTypeCapitalized =
          itemType.slice(0, 1).toUpperCase() + itemType.slice(1);
        arr.push(
          `<:black_arrow:1229396585956380715> **${index + 1}.** ${
            item.rarity
          } ${item.name} (${itemTypeCapitalized}) ID: \`${item.uid}\``
        );
      });
      await player.equippedTechniques.map((technique, index) => {
        const newIndex = equippedItemsIndex.length + index + 1;
        arr.push(
          `<:black_arrow:1229396585956380715> **${newIndex}.** ${technique.name} (Technique | ${technique.stage} | \`${technique.proficiency}\`) ID: \`${technique.uid}\``
        );
      });
    } else {
      arr.push(`\n > **Equipped Items**`);
      arr.push(`> You do not have any equipped items in your layout.`);
    }

    const embed = new EmbedBuilder()
      .setTitle(`Inventory`)
      .setDescription(arr.join("\n"))
      .setColor(config.color.main)
      .setFooter({
        text: `Xianxia RPG V1.0.0 | Page 1/1`,
      });

    const firstPageButton = new ButtonBuilder()
      .setCustomId("inventory_first_page")
      .setEmoji("<:first_page:1234819860601503755>")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const prevPageButton = new ButtonBuilder()
      .setCustomId("inventory_prev_page")
      .setEmoji("<:previous_page:1234820280409522196>")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const useItemsButton = new ButtonBuilder()
      .setCustomId("inventory_use_items")
      .setLabel("Use Items")
      .setStyle(ButtonStyle.Success);

    const nextPageButton = new ButtonBuilder()
      .setCustomId("inventory_next_page")
      .setEmoji("<:next_page:1234820047344767058>")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const lastPageButton = new ButtonBuilder()
      .setCustomId("inventory_last_page")
      .setEmoji("<:lastPage:1234819953526312990>")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const filtersMenu = new StringSelectMenuBuilder()
      .setCustomId("inventory_filters")
      .setPlaceholder("Select a filter to sort items from inventory")
      .addOptions([
        new StringSelectMenuOptionBuilder()
          .setLabel("Home Page")
          .setValue("home")
          .setDescription("Show all items available in your inventory!")
          .setEmoji("🏠"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Gears")
          .setValue("weapons")
          .setDescription("Show only gears avaliable in your inventory!")
          .setEmoji("⚔"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Usables")
          .setValue("usables")
          .setDescription("Show only usable items avaliable in your inventory!")
          .setEmoji("<:Level:1229327884091527219>"),
        new StringSelectMenuOptionBuilder()
          .setLabel("Techniques")
          .setValue("techniques")
          .setDescription(
            "Show all the avaliable techniques in your inventory!"
          )
          .setEmoji("📚"),
      ]);

    const buttonsActionRow = new ActionRowBuilder().addComponents(
      firstPageButton,
      prevPageButton,
      useItemsButton,
      nextPageButton,
      lastPageButton
    );

    const filtersActionRow = new ActionRowBuilder().addComponents(filtersMenu);

    await interaction.reply({
      embeds: [embed],
      components: [buttonsActionRow, filtersActionRow],
    });

    const filter = (i) =>
      i.user.id === interaction.user.id && i.guildId === interaction.guildId;
    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", async (i) => {
      if (i.isStringSelectMenu() && i.customId === "inventory_filters") {
        // await i.deferUpdate();
        const value = i.values[0];
        if (value === "home") {
          await i.update({
            embeds: [embed],
            components: [buttonsActionRow, filtersActionRow],
          });
        } else if (value === "weapons") {
          if (!inventory.some((item) => item.type === "weapon")) {
            return i.update({
              embeds: [
                embed.setDescription(
                  "> You do not have any weapons in your inventory."
                ),
              ],
              components: [buttonsActionRow, filtersActionRow],
            });
          }
          const weapons = inventory.filter((item) => item.type === "weapon");
          const weaponArr = [`> **Weapons**`];
          await weapons.map((item, index) => {
            weaponArr.push(
              `<:black_arrow:1229396585956380715> **${index + 1}.** ${
                item.rarity
              } ${item.name} ID: \`${item.uid}\``
            );
          });
          const weaponEmbed = new EmbedBuilder()
            .setTitle("Weapons")
            .setDescription(weaponArr.join("\n"))
            .setColor(config.color.main)
            .setFooter({
              text: `Xianxia RPG V1.0.0 | Page 1/1`,
            });
          await i.update({
            embeds: [weaponEmbed],
            components: [buttonsActionRow, filtersActionRow],
          });
        } else if (value === "usables") {
          if (!inventory.some((item) => item.type === "item")) {
            return i.update({
              embeds: [
                embed.setDescription(
                  "> You do not have any usable items in your inventory."
                ),
              ],
              components: [buttonsActionRow, filtersActionRow],
            });
          }
          const usables = inventory.filter((item) => item.type === "item");
          const usableArr = [`> **Usables**`];
          await usables.map((item, index) => {
            usableArr.push(
              `<:black_arrow:1229396585956380715> **${index + 1}.** ${
                item.rarity
              } ${item.name} ID: \`${item.uid}\``
            );
          });
          const usableEmbed = new EmbedBuilder()
            .setTitle("Usables")
            .setDescription(usableArr.join("\n"))
            .setColor(config.color.main)
            .setFooter({
              text: `Xianxia RPG V1.0.0 | Page 1/1`,
            });
          await i.update({
            embeds: [usableEmbed],
            components: [buttonsActionRow, filtersActionRow],
          });
        } else if (value === "techniques") {
          if (!techniques.length) {
            return i.update({
              embeds: [
                embed.setDescription(
                  "> You do not have any techniques in your inventory."
                ),
              ],
              components: [buttonsActionRow, filtersActionRow],
            });
          }
          const techniqueArr = [`> **Techniques**`];
          await techniques.map((technique, index) => {
            techniqueArr.push(
              `<:black_arrow:1229396585956380715> **${index + 1}.** ${
                technique.name
              } ID: \`${technique.uid}\``
            );
          });
          const techniqueEmbed = new EmbedBuilder()
            .setTitle("Techniques")
            .setDescription(techniqueArr.join("\n"))
            .setColor(config.color.main)
            .setFooter({
              text: `Xianxia RPG V1.0.0 | Page 1/1`,
            });
          await i.update({
            embeds: [techniqueEmbed],
            components: [buttonsActionRow, filtersActionRow],
          });
        }
      } else if (i.isButton() && i.customId === "inventory_use_items") {
        const useItemsModal = new ModalBuilder()
          .setTitle("Use Items")
          .setCustomId("inventory_use_items_modal");

        const useItemsInput = new TextInputBuilder()
          .setCustomId("inventory_use_items_input")
          .setLabel("Item UID")
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
          .setMinLength(1)
          .setMaxLength(8);

        const inputRow = new ActionRowBuilder().addComponents(useItemsInput);

        useItemsModal.addComponents(inputRow);

        await i.showModal(useItemsModal);

        client.on("interactionCreate", async (input) => {
          if (!input.isModalSubmit()) return;
          if (input.user.id !== interaction.user.id) return;
          if (input.customId !== "inventory_use_items_modal") return;
          // await input.deferUpdate();
          const itemUid = input.fields.getTextInputValue(
            "inventory_use_items_input"
          );
          const item =
            inventory.find((item) => item.uid === `${itemUid}`) ||
            techniques.find((technique) => technique.uid === `${itemUid}`);
          if (!item) {
            return input.update({
              embeds: [
                embed.setDescription(
                  `> Item with ID: \`${itemUid}\` does not exist in your inventory!`
                ),
              ],
              components: [buttonsActionRow, filtersActionRow],
            });
          }

          const player2 = await schema.findOne({ userId: interaction.user.id });

          const disabledButtons = new ActionRowBuilder().addComponents(
            firstPageButton.setDisabled(true),
            prevPageButton.setDisabled(true),
            useItemsButton.setDisabled(true),
            nextPageButton.setDisabled(true),
            lastPageButton.setDisabled(true)
          );

          const disabledFilters = new ActionRowBuilder().addComponents(
            filtersMenu.setDisabled(true)
          );

          if (
            config.techniques.find((technique) => technique.name === item.name)
          ) {
            const technique = player2.techniques.find(
              (tech) => tech.name === item.name
            );
            if (
              player2.equippedTechniques.some(
                (tech) => tech.name === technique.name
              )
            ) {
              return input.update({
                embeds: [
                  embed.setDescription(
                    `> You already have this technique equipped in your inventory!`
                  ),
                ],
                components: [disabledButtons, disabledFilters],
              });
            }
            player2.equippedTechniques.push(technique);
            player2.techniques = player2.techniques.filter(
              (i) => i.uid !== item.uid
            );
            await player2.save();
            return input.update({
              embeds: [
                embed.setDescription(
                  `> You have successfully equipped the technique: \`${technique.name}\`!`
                ),
              ],
              components: [disabledButtons, disabledFilters],
            });
          } else if (item.type === "weapon") {
            const equippedItem = player2.equippedItems.find(
              (i) => i.name === item.name
            );
            if (equippedItem) {
              return input.update({
                embeds: [
                  embed.setDescription(
                    `> You already have this item equipped in your inventory.`
                  ),
                ],
                components: [disabledButtons, disabledFilters],
              });
            }
            player2.equippedItems.push(item);
            player2.inventory = player2.inventory.filter(
              (i) => i.uid !== `${item.uid}`
            );
            await player2.save();

            input.update({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Item Used")
                  .setDescription(
                    `<:black_arrow:1229396585956380715> You have successfully equipped the item **${item.rarity} ${item.name}**.`
                  )
                  .setColor(config.color.main)
                  .setTimestamp(),
              ],
              components: [disabledButtons, disabledFilters],
            });
          } else if (item.type === "item") {
            // ask for quantity and add bulk use button and a single use button
            const ItemSingleUse = new ButtonBuilder()
              .setCustomId("inventory_use_items_single")
              .setLabel("Single Use")
              .setStyle(ButtonStyle.Success);

            const ItemBulkUse = new ButtonBuilder()
              .setCustomId("inventory_use_items_bulk")
              .setLabel("Bulk Use")
              .setStyle(ButtonStyle.Danger);

            const quantityRow = new ActionRowBuilder().addComponents(
              ItemSingleUse,
              ItemBulkUse
            );

            await input.update({
              embeds: [
                new EmbedBuilder()
                  .setTitle("Item Quantity")
                  .setDescription(
                    `<:black_arrow:1229396585956380715> How many of the item **${item.rarity} ${item.name}** would you like to use?`
                  )
                  .setColor(config.color.main)
                  .setTimestamp(),
              ],
              components: [quantityRow],
            });

            const filter = (i) =>
              i.user.id === interaction.user.id &&
              i.guildId === interaction.guildId;
            const quantityCollector =
              interaction.channel.createMessageComponentCollector({
                filter,
                time: 60000,
              });

            quantityCollector.on("collect", async (quantityInteraction) => {
              if (
                quantityInteraction.isButton() &&
                quantityInteraction.customId === "inventory_use_items_single"
              ) {
                const player3 = await schema.findOne({
                  userId: interaction.user.id,
                });
                const item3 = player3.inventory.find(
                  (i) => i.uid === `${itemUid}`
                );
                if (item3.quantity === 0) {
                  return quantityInteraction.update({
                    embeds: [
                      new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(
                          `<:black_arrow:1229396585956380715> You do not have any more of this item in your inventory.`
                        )
                        .setColor(config.color.main)
                        .setTimestamp(),
                    ],
                    components: [disabledButtons, disabledFilters],
                  });
                }
                if (item3.quantity === 1) {
                  player3.cultivation.experience += item.powerXp;
                  player3.inventory = player3.inventory.filter(
                    (i) => i.uid !== `${item3.uid}`
                  );
                  await player3.save();
                } else {
                  item3.quantity -= 1;
                  player3.cultivation.experience += item.powerXp;
                  await player3.save();
                };

                quantityInteraction.update({
                  embeds: [
                    new EmbedBuilder()
                      .setTitle("Item Used")
                      .setDescription(
                        `<:black_arrow:1229396585956380715> You have successfully used the item **${item.rarity} ${item.name} 1x** and got **${item.powerXp}** experience.`
                      )
                      .setColor(config.color.main)
                      .setTimestamp(),
                  ],
                  components: [disabledButtons, disabledFilters],
                });
              } else if (
                quantityInteraction.isButton() &&
                quantityInteraction.customId === "inventory_use_items_bulk"
              ) {
                const player4 = await schema.findOne({
                  userId: interaction.user.id,
                });
                const item4 = player4.inventory.find(
                  (i) => i.uid === `${itemUid}`
                );
                if (item4.quantity === 0) {
                  return quantityInteraction.update({
                    embeds: [
                      new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(
                          `<:black_arrow:1229396585956380715> You do not have any more of this item in your inventory.`
                        )
                        .setColor(config.color.main)
                        .setTimestamp(),
                    ],
                    components: [disabledButtons, disabledFilters],
                  });
                }
                player4.cultivation.experience += item4.powerXp * item4.quantity;
                player4.inventory = player4.inventory.filter(
                  (i) => i.uid !== `${item4.uid}`
                );
                await player4.save();

                quantityInteraction.update({
                  embeds: [
                    new EmbedBuilder()
                      .setTitle("Item Used")
                      .setDescription(
                        `<:black_arrow:1229396585956380715> You have successfully used the item **${item.rarity} ${item.name} ${item4.quantity}x** and got **${item4.powerXp * item4.quantity}** experience.`
                      )
                      .setColor(config.color.main)
                      .setTimestamp(),
                  ],
                  components: [disabledButtons, disabledFilters],
                });
              };
            });
          }
        });
      }
    });

    collector.on("end", async () => {
      const disabledButtons = new ActionRowBuilder().addComponents(
        firstPageButton.setDisabled(true),
        prevPageButton.setDisabled(true),
        useItemsButton.setDisabled(true),
        nextPageButton.setDisabled(true),
        lastPageButton.setDisabled(true)
      );

      const disabledFilters = new ActionRowBuilder().addComponents(
        filtersMenu.setDisabled(true)
      );

      await interaction.editReply({
        components: [disabledButtons, disabledFilters],
      });
    });
  },
};
