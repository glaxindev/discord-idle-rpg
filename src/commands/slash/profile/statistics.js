const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient.js');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('statistics')
        .setDescription('Shows your statistics or the statistics of a user.')
        .addUserOption(option => option.setName('target').setDescription('The user to show information about').setRequired(false)),
    options: {
        cooldown: 5000
    },
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        const user = interaction.options.getUser('target') || interaction.user;
        const Schema = require('../../../schemas/PlayerSchema.js');
        const player = await Schema.findOne({ userId: user.id });

        if (!player) {
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('<:error:1229320037131882598> You or the target do not have a profile, please use `/start` to create a profile and start playing!')
                    .setColor(config.color.main)
                    .setTimestamp()
            ], ephemeral: true });
        }
        const arr = [
            `<:black_arrow:1229396585956380715> **Username:** ${user.username}`,
            // `<:black_arrow:1229396585956380715> **Level:** ${player.level}`,
            // `<:black_arrow:1229396585956380715> **Current XP:** ${player.currentXp}`,
            // `<:black_arrow:1229396585956380715> **Required XP:** ${player.requiredXp}`,
            `<:black_arrow:1229396585956380715> **Power XP:** ${player.powerlevel}`,
            `<:black_arrow:1229396585956380715> **Cultivation:** <${player.cultivation.realm}> ${player.cultivation.step} ${player.cultivation.stage}`,
            `<:black_arrow:1229396585956380715> **Money:** ${player.money} cash`,
            `<:black_arrow:1229396585956380715> **Inventory:** ${player.inventory.length}`,
            `<:black_arrow:1229396585956380715> **Equipped Items:** ${player.equippedItems.length}`,
            // `<:black_arrow:1229396585956380715> **Stats:**`,
            `<:black_arrow:1229396585956380715> **Strength:** ${player.stats.strength} points`,
            `<:black_arrow:1229396585956380715> **Agility:** ${player.stats.agility} points`,
            `<:black_arrow:1229396585956380715> **Endurance:** ${player.stats.endurance} points`,
            `<:black_arrow:1229396585956380715> **Fortune:** ${player.stats.fortune} points`,
            `<:black_arrow:1229396585956380715> **Wisdom:** ${player.stats.wisdom} points`
        ];

        const embed = new EmbedBuilder()
            .setTitle('Player Statistics')
            .setDescription(arr.join('\n'))
            .setColor(require('../../../config.js').color.main)
            // .setFooter('This is a footer')
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
};
