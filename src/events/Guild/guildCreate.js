const config = require('../../config');
const ExtendedClient = require('../../class/ExtendedClient');
const { EmbedBuilder, ChannelType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { log } = require('../../functions');

module.exports = {
    event: 'guildCreate',
    /**
     * 
     * @param {ExtendedClient} client 
     * @param {import('discord.js').Guild} guild 
     * @returns 
     */
    run: async (client, guild) => {
        const arr = [
            `Thanks for the invitation. \n`,
            `The world of cultivation is vast. Throughout are numerous opportunities for becoming powerful. \n`,
            `However, a carp does not become a dragon overnight. \n`,
            `*...Everlasting life, will you be the one to attain it?* \n`,
            `> **You can begin playing by typing:** \`/Profile\``,
        ];

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel('Support Server')
                    .setURL(config.client.supportServer),
            );

        const embed = new EmbedBuilder()
            .setTitle('Xianxia RPG Descends!')
            .setDescription(arr.join('\n'))
            .setColor(config.color.main);

        let channel = guild.channels.cache.find(ch => ch.type === ChannelType.GuildText);
        if (!channel) channel = guild.systemChannel ?? guild.channels.cache.find(ch => ch.name.includes('general' || 'chat' || 'lounge')) ?? guild.channels.cache.first();
        if (!channel) return log(`Failed to send welcome message to guild: ${guild.name} (${guild.id})`, 'err');

        channel.send({ embeds: [embed], components: [row] });
        log(`Joined guild: ${guild.name} (${guild.id})`, 'info');
    }
};
