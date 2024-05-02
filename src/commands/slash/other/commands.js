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
                name: 'profile',
                description: 'Shows your or target user profile to you.'
            },
            {
                name: 'journey',
                description: 'Asks you multiple questions to determine your journey.'
            },
            {
                name: 'inventory',
                description: 'Shows the items you have in your inventory.'
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
                name: 'commands',
                description: 'Lists all the commands available in the bot.'
            },
            {
                name: 'botinfo',
                description: 'Shows information about the bot.'
            }
        ];

        const arr = [];

        const embed = new EmbedBuilder()
            .setTitle('Commands List')
            .setColor(config.color.main)
            .setTimestamp();

        await commands.forEach((command, index) => {
            arr.push(`<:black_arrow:1229396585956380715> /**${command.name}**`);
        });

        embed.setDescription(arr.join('\n'));

        const button = new ButtonBuilder()
            .setCustomId('commands')
            .setLabel('Happy Adventuring!')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true);

        const actionRow = new ActionRowBuilder()
            .addComponents(button);

        interaction.reply({ embeds: [embed], components: [] });
    }
};
