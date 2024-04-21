const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient.js');
const schema = require('../../../schemas/PlayerSchema.js');
const config = require('../../../config.js');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('shop')
        .setDescription('Shows you the shop where you can buy items.'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {

        if (!schema.findOne({ userId: interaction.user.id })) {
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('<:error:1229320037131882598> You do not have a profile, please use `/start` to create a profile and start playing!')
                    .setColor(config.color.main)
                    .setTimestamp()
            ], ephemeral: true });
        };

        const items = config.itemTypes;
        const arr = [
            `**Item Name‎ ‎‎  Price ‎ **`,
            `<:black_arrow:1229396585956380715> Here you can buy items to help you on your journey.`,
            `\n`,
        ];

        const embed = new EmbedBuilder()
            .setTitle('Items Shop')
            .setColor(config.color.main)
            .setTimestamp();

        items.forEach((item, index) => {
            arr.push(`<:black_arrow:1229396585956380715> **${item.uid}** ${item.rarity} ${item.name} - ${item.price} Cash`);
        });

        embed.setDescription(arr.join('\n'));

        const buyButton = new ButtonBuilder()
            .setCustomId('buy')
            .setLabel('Select And Buy Items')
            .setStyle(ButtonStyle.Secondary);

            const buyButtonRow = new ActionRowBuilder()
            .addComponents(buyButton);

       await interaction.reply({ embeds: [embed], components: [buyButtonRow] });

       const filter = i => i.customId === 'buy' && i.user.id === interaction.user.id;
       const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

         collector.on('collect', async i => {
              const Items = config.itemTypes;
              const options = [];
                Items.forEach((item, index) => {
                    options.push(new StringSelectMenuOptionBuilder()
                        .setLabel(`${item.rarity} ${item.name}`)
                        .setDescription(`The ${item.rarity} ${item.name} costs ${item.price} cash.`)
                        .setValue(`${item.uid}`)
                    );
                });

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select')
                    .setPlaceholder('Select an item to buy from the shop')
                    .setMinValues(1)
                    .setMaxValues(1)
                    .addOptions(options);

                const selectMenuRow = new ActionRowBuilder()
                    .addComponents(selectMenu);

                    const embed = new EmbedBuilder()
                    .setTitle('Items Shop')
                    .setColor(config.color.main)
                    // .setTimestamp()
                    .setDescription('<:black_arrow:1229396585956380715> Please select an item to buy from the shop.');

                await i.update({ embeds: [embed], components: [selectMenuRow] });

                const filter = i => i.customId === 'select' && i.user.id === interaction.user.id;
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async i => {
                    const item = config.itemTypes.find(item => item.uid === i.values[0]);
                    const player = await schema.findOne({ userId: interaction.user.id });

                    const disabledSelectMenuRow = new ActionRowBuilder()
                        .addComponents(selectMenu.setDisabled(true));

                    if (!player) {
                        return i.update({ embeds: [
                            new EmbedBuilder()
                                .setTitle('Items Shop')
                                .setColor("#FF0000")
                                .setDescription(`<:black_arrow:1229396585956380715> You need to create your profile by typing /profile create.`)
                        ], components: [disabledSelectMenuRow] });
                    };

                    // if (player.level < item.requiredLevel) {
                    //     return i.update({ embeds: [
                    //         new EmbedBuilder()
                    //             .setTitle('Items Shop')
                    //             .setColor("#FF0000")
                    //             .setDescription(`<:black_arrow:1229396585956380715> You need to be at least level ${item.requiredLevel} to buy this item.`)
                    //     ], components: [disabledSelectMenuRow] });
                    // }

                    if (player.money < item.price) {
                        return i.update({ embeds: [
                            new EmbedBuilder()
                                .setTitle('Items Shop')
                                .setColor("#FF0000")
                                .setDescription(`<:black_arrow:1229396585956380715> You don't have enough cash to buy this item.`)
                        ], components: [disabledSelectMenuRow] });
                    };

                    if (player.inventory.find(i => i.uid === item.uid)) {
                        return i.update({ embeds: [
                            new EmbedBuilder()
                                .setTitle('Items Shop')
                                .setColor("#FF0000")
                                .setDescription(`<:black_arrow:1229396585956380715> You already have this item in your inventory.`)
                        ], components: [disabledSelectMenuRow] });
                    };

                    player.inventory.push(item);
                    player.money -= item.price;
                    await player.save();

                    i.update({ embeds: [
                        new EmbedBuilder()
                            .setTitle('Items Shop')
                            .setColor(config.color.main)
                            .setDescription(`<:black_arrow:1229396585956380715> You have successfully bought the ${item.rarity} ${item.name}.`)
                    ], components: [disabledSelectMenuRow] });
                });

                collector.on('end', async collected => {
                    if (collected.size === 0) {
                        await i.update({ content: 'You took too long to select an item to buy.', components: [] });
                    }
                });
         });
    }
};