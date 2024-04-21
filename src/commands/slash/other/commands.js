const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const config = require('../../../config.js');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('commands')
        .setDescription('Lists all the commands available in the bot.'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const commands = [
            {
                name: 'start',
                description: 'Starts your adventure by creating a character.'
            },
            {
                name: 'profile',
                description: 'Shows your or target user profile to you.'
            },
            {
                name: 'statistics',
                description: 'Shows your or target user statistics to you.'
            },
            {
                name: 'journey',
                description: 'Asks you multiple questions to determine your journey.'
            },
            {
                name: 'inventory view',
                description: 'Shows the items you have in your inventory.'
            },
            {
                name: 'inventory use',
                description: 'Use/equip an item from your inventory.'
            },
            {
                name: 'inventory upgrade',
                description: 'Upgrade an item from your inventory.'
            },
            {
                name: 'leaderboard',
                description: 'Shows the top 10 users of the bot.'
            },
            {
                name: 'cultivate',
                description: 'Cultivate to gain experience and breakthrough.'
            },
            {
                name: 'shop',
                description: 'Shows you the shop where you can buy items.'
            },
            {
                name: 'commands',
                description: 'Lists all the commands available in the bot.'
            },
            {
                name: 'challenge',
                description: 'The mentioned user is autobattled, turn based.'
            },
            {
                name: 'techniques view',
                description: 'Shows you the techniques you have in your inventory.'
            },
            {
                name: 'techniques equip',
                description: 'Equip a technique from your inventory.'
            },
            {
                name: 'techniques unequip',
                description: 'Unequip a technique from your inventory.'
            },
            {
                name: 'techniques info',
                description: 'Shows you the information of a technique.'
            }
        ];

        const arr = [
            `**Command Name‎ ‎‎  ‎‎  Description**`,
            `<:black_arrow:1229396585956380715> Here you can see all the commands available in the bot.`,
            `\n`,
        ];

        const embed = new EmbedBuilder()
            .setTitle('Commands List')
            .setColor(config.color.main)
            .setTimestamp();

        await commands.forEach((command, index) => {
            arr.push(`<:black_arrow:1229396585956380715> [**${command.name}** - ${command.description}](https://immadebyglaxindev.com)`);
        });

        embed.setDescription(arr.join('\n'));

        const button = new ButtonBuilder()
            .setCustomId('commands')
            .setLabel('Happy Adventuring!')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true);

        const actionRow = new ActionRowBuilder()
            .addComponents(button);

        interaction.reply({ embeds: [embed], components: [actionRow] });
    }
};
