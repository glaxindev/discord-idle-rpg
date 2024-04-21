const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");
const ExtendedClient = require("../../../class/ExtendedClient");
const schema = require("../../../schemas/PlayerSchema.js");
const config = require("../../../config.js");

module.exports = {
  structure: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows your inventory and the items you have.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("Shows your inventory and the items you have.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("use")
        .setDescription("Use an item from your inventory.")
        .addIntegerOption((option) =>
          option
            .setName("uid")
            .setDescription("The item you want to use.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("upgrade")
        .setDescription("Upgrade an item from your inventory.")
        .addIntegerOption((option) =>
          option
            .setName("uid")
            .setDescription("The item you want to upgrade.")
            .setRequired(true)
        )
    ),
  options: {
    cooldown: 5000,
  },
  /**
   * @param {ExtendedClient} client
   * @param {ChatInputCommandInteraction} interaction
   */
  run: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "view":
        const player = await schema.findOne({ userId: interaction.user.id });
        if (!player)
        return interaction.reply({ embeds: [
          new EmbedBuilder()
              .setTitle('Error')
              .setDescription('<:error:1229320037131882598> You do not have a profile, please use `/start` to create a profile and start playing!')
              .setColor(config.color.main)
              .setTimestamp()
      ], ephemeral: true });
        const inventory = player.inventory;
        if (inventory.length < 1)
          return interaction.reply(
            "You do not have any items in your inventory."
          );

        const arr = [];
        await inventory.map((item, index) => {
          arr.push(
            `<:black_arrow:1229396585956380715> **${item.uid}** - ${item.rarity} ${item.name}`
          );
        });

        const embed = new EmbedBuilder()
          .setTitle("Items in your Inventory")
          .setDescription(arr.join("\n"))
          .setColor(config.color.main)
          .setTimestamp();

        if (player.equippedItems.length > 0) {
          const equippedItemsEmbed = new EmbedBuilder()
            .setTitle("Your Equipped Items")
            .setDescription(
              player.equippedItems
                .map(
                  (item, index) =>
                    `<:black_arrow:1229396585956380715> **${item.uid}** - ${item.rarity} ${item.name}`
                )
                .join("\n")
            )
            .setColor(config.color.main)
            .setTimestamp();
          // .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL());

          interaction.reply({ embeds: [embed, equippedItemsEmbed] });
        } else {
          interaction.reply({ embeds: [embed] });
        }
        break;
      case "use":
        const uid = interaction.options.getInteger("uid");
        const player2 = await schema.findOne({ userId: interaction.user.id });
        if (!player2)
        return interaction.reply({ embeds: [
          new EmbedBuilder()
              .setTitle('Error')
              .setDescription('<:error:1229320037131882598> You do not have a profile, please use `/start` to create a profile and start playing!')
              .setColor(config.color.main)
              .setTimestamp()
      ], ephemeral: true });
        const inventory2 = player2.inventory;
        const item = inventory2.find((item) => item.uid === `${uid}`);
        if (!item)
          return interaction.reply("You do not have an item with that UID.");
        
          if (item.type === "weapon") {
            const equippedItem = player2.equippedItems.find(
              (i) => i.name === item.name
            );
            if (equippedItem) {
              return interaction.reply(
                "You already have this item equipped in your inventory."
              );
            }
            player2.equippedItems.push(item);
            player2.inventory = player2.inventory.filter((i) => i.uid !== `${uid}`);
            await player2.save();
          } else if (item.type === "item") {
            player2.powerlevel += item.powerXp;
            player2.inventory = player2.inventory.filter((i) => i.uid !== `${uid}`);
            await player2.save();
          };

        interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Item Used")
              .setDescription(
                `<:black_arrow:1229396585956380715> You have successfully ${item.type === "weapon" ? "equipped" : "used"} the item **${item.name}**${item.type === "weapon" ? `.` : ` and got ${item.powerXp} power.`}`
              )
              .setColor(config.color.main)
              .setTimestamp(),
          ]
        });

        break;
      case "upgrade": {
        await interaction.deferReply({ ephemeral: false });
        const player3 = await schema.findOne({ userId: interaction.user.id });
        if (!player3) {
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('<:error:1229320037131882598> You do not have a profile, please use `/start` to create a profile and start playing!')
                    .setColor(config.color.main)
                    .setTimestamp()
            ], ephemeral: true });
        }

        const item = interaction.options.getInteger('uid');
        const itemIndex = player3.inventory.findIndex(i => i.uid === `${item}`);
        if (itemIndex === -1) return interaction.editReply({ content: 'You do not have this item in your inventory.', ephemeral: false });

        const itemData = config.itemTypes.find(i => i.uid === `${item}`);
        const isUpgradable = player3.inventory.some(i => i.uid === `${item}` && i.upgradable);
        if (!itemData.upgradable || isUpgradable === false) return interaction.editReply({ content: 'This item is no longer upgradable or fully upgraded..', ephemeral: false });
        // if (player3.level < itemData.requiredLevel) return interaction.editReply({ content: `You need to be at least level ${itemData.requiredLevel} to upgrade this item.`, ephemeral: false });

        const upgradeCost = itemData.upgradeCost;
        if (player3.money < upgradeCost) return interaction.editReply({ content: `You need ${upgradeCost} cash to upgrade this item.`, ephemeral: false });

        player3.money -= upgradeCost;
        player3.inventory[itemIndex] = {
            ...player3.inventory[itemIndex],
            attack: player3.inventory[itemIndex].attack + itemData.upgradeAttack,
            upgraded: true,
            price: player3.inventory[itemIndex].price + upgradeCost,
            upgradable: false
        };
        await player3.save();

        interaction.editReply({ embeds: [
            new EmbedBuilder()
                .setTitle('Item Upgraded')
                .setDescription(`<:black_arrow:1229396585956380715> You have upgraded your **${itemData.rarity} ${itemData.name}** to **Level 2** for ${upgradeCost} cash.`)
                .setColor(config.color.main)
                .setTimestamp()
        ] });
        break;
      }
    }
  },
};
