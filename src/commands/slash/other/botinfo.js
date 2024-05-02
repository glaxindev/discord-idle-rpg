const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient.js');
const schema = require('../../../schemas/PlayerSchema.js');
const config = require('../../../config.js');
const { version } = require('../../../../package.json');
const discordVersion = require('discord.js').version;
const os = require('os');
const moment = require('moment');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription('Shows information about the bot.'),
        options: {
          cooldown: 5000,
        },
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
      await interaction.deferReply({ ephemeral: false });

      const uptime = moment(client.readyAt).format('X');

      let platform = os.platform();
      if (platform === 'win32') platform = 'Windows';
      else if (platform === 'linux') platform = 'Linux';
      else if (platform === 'darwin') platform = 'MacOS';

      const totalClusters = client.cluster.count;
      const currentCluster = client.cluster.id;

      const arr = [
        `> ** Bot Info **`,
        `<:black_arrow:1229396585956380715> **Bot Version:** ${version}`,
        `<:black_arrow:1229396585956380715> **Discord.js Version:** ${discordVersion}`,
        `<:black_arrow:1229396585956380715> **Node.js Version:** ${process.version}`,
        `<:black_arrow:1229396585956380715> **Platform:** ${platform}`,
        `<:black_arrow:1229396585956380715> **Uptime:** <t:${uptime}:R>`,
        `<:black_arrow:1229396585956380715> **Cluster:** ${currentCluster}/${totalClusters}`,
        `<:black_arrow:1229396585956380715> **Memory Usage:** ${(process.memoryUsage().heapUsed / 1024 / 1024 - 20).toFixed(2)} MB`,
        `<:black_arrow:1229396585956380715> **Servers:** ${client.guilds.cache.size}`,
        `<:black_arrow:1229396585956380715> **Users:** ${client.users.cache.size}`,
        `<:black_arrow:1229396585956380715> **Latency:** ${client.ws.ping}ms`,
        `<:black_arrow:1229396585956380715> **Player Count:** ${await schema.countDocuments()}`,
        // `\n`,
        // `> **Links**`,
        // `<:black_arrow:1229396585956380715> [Invite Me To Your Server](https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands)`,
        // `<:black_arrow:1229396585956380715> [Join My Support Server](${config.client.supportServer})`,
      ];

        const embed = new EmbedBuilder()
            .setTitle(`Xianxia RPG`)
            .setDescription(arr.join('\n'))
            .setColor(config.color.main)
            // .setFooter(`Requested by ${interaction.user.tag}`, interaction.user.displayAvatarURL());
            .setTimestamp();

            const row = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Link)
                  .setLabel('Invite Bot')
                  .setURL(`https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`),
                new ButtonBuilder()
                  .setStyle(ButtonStyle.Link)
                  .setLabel('Support Server')
                  .setURL(config.client.supportServer)
              );

        interaction.editReply({ embeds: [embed], components: [row] });
    }
};
