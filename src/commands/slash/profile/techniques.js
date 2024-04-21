const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const schema = require('../../../schemas/PlayerSchema.js');
const config = require('../../../config.js');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('techniques')
        .setDescription('View or equip your techniques, one technique at a time.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('Show all the techniques you have in your inventory.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('equip')
                .setDescription('Equip a technique from your inventory.')
                .addIntegerOption(
                    option => option
                        .setName('technique')
                        .setDescription('The technique you want to equip.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('Get information about a specific technique.')
                .addIntegerOption(
                    option => option
                        .setName('technique')
                        .setDescription('The technique you want to get information about.')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('unequip')
                .setDescription('Unequip a technique from your inventory.')
                .addIntegerOption(
                    option => option
                        .setName('technique')
                        .setDescription('The technique you want to unequip.')
                        .setRequired(true)
                )
        ),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.deferReply();
        const player = await schema.findOne({ userId: interaction.user.id });
        
        if (!player) {
            return interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('<:error:1229320037131882598> You do not have a profile, please use `/start` to create a profile and start playing!')
                    .setColor(config.color.main)
                    .setTimestamp()
            ], ephemeral: true });
        }

            const subcommand = interaction.options.getSubcommand();
            if (subcommand === 'view') {
                if (!player.techniques.length && player.equippedTechniques.length) {
                    return interaction.editReply({ embeds: [
                        new EmbedBuilder()
                            .setTitle('Techniques')
                            .setDescription('You do not have any techniques in your inventory.')
                            .setColor(config.color.main)
                            .setTimestamp()
                    ] });
                }

                const techniques = player.techniques.map((technique, index) => {
                    return `<:black_arrow:1229396585956380715> **${technique.uid}** ${technique.name} - ${technique.effect}`;
                });

                let equippedTechnique;
                if (player.equippedTechniques) {
                    equippedTechnique = player.equippedTechniques;
                };

                const arr1 = [
                    `**Available Techniques**`,
                ];

                const arr2 = [
                    `\n`,
                    `**Equipped Techniques**`,
                ];

                if (player.techniques.length > 0) {
                for (let i = 0; i < techniques.length; i++) {
                    arr1.push(techniques[i]);
                    // arr1.push(`\n`);
                };
                } else {
                    arr1.push('<:black_arrow:1229396585956380715> You do not have any techniques in your inventory.');
                    // arr1.push(`\n`);
                };

                if (player.equippedTechniques.length > 0) {
                    for (let i = 0; i < equippedTechnique.length; i++) {
                        arr2.push(`<:black_arrow:1229396585956380715> **${i + 1}.** ${equippedTechnique[i].name}`);
                    };
                } else {
                    arr2.push('<:black_arrow:1229396585956380715> You do not have any equipped techniques in your inventory.');
                };

                const mainArr = arr1.concat(arr2);

                const embed = new EmbedBuilder()
                    .setTitle('Your Techniques')
                    .setDescription(mainArr.join('\n'))
                    .setColor(config.color.main)
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            };

            if (subcommand === 'equip') {
                const technique = interaction.options.getInteger('technique');

                if (!player.techniques.length) {
                    return interaction.editReply({ embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription('<:error:1229320037131882598> You do not have any techniques in your inventory.')
                            .setColor(config.color.main)
                            .setTimestamp()
                    ] });
                };

                const techniqueToEquip = player.techniques.find(t => t.uid === `${technique}`);
                if (!techniqueToEquip) {
                    return interaction.editReply({ embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription('<:error:1229320037131882598> You do not have this technique in your inventory.')
                            .setColor(config.color.main)
                            .setTimestamp()
                    ] });
                };

                if (player.equippedTechniques.length >= 3) {
                    return interaction.editReply({ embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription('<:error:1229320037131882598> You can only equip 3 techniques at a time.')
                            .setColor(config.color.main)
                            .setTimestamp()
                    ] });
                };

                if (player.equippedTechniques.find(t => t.uid === `${technique}`)) {
                    return interaction.editReply({ embeds: [
                        new EmbedBuilder()
                            .setTitle('Error')
                            .setDescription('<:error:1229320037131882598> You already have this technique equipped.')
                            .setColor(config.color.main)
                            .setTimestamp()
                    ] });
                };

                player.equippedTechniques.push(techniqueToEquip);
                player.techniques = player.techniques.filter(t => t.uid !== `${technique}`);
                player.equippedTechniques.find(t => t.uid === `${technique}`).equip = true;
                await player.save();

                return interaction.editReply({ embeds: [
                    new EmbedBuilder()
                        .setTitle('Technique Equipped')
                        .setDescription(`<:black_arrow:1229396585956380715> You have equipped the technique **${techniqueToEquip.name}**.`)
                        .setColor(config.color.main)
                        .setTimestamp()
                ] });
        };

        if (subcommand === 'info') {
            const technique = interaction.options.getInteger('technique');

            if (!player.techniques.length) {
                return interaction.editReply({ embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('<:error:1229320037131882598> You do not have any techniques in your inventory.')
                        .setColor(config.color.main)
                        .setTimestamp()
                ] });
            };

            const techniqueToInfo = player.techniques.find(t => t.uid === `${technique}`);
            if (!techniqueToInfo) {
                return interaction.editReply({ embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('<:error:1229320037131882598> You do not have this technique in your inventory.')
                        .setColor(config.color.main)
                        .setTimestamp()
                ] });
            };


            // proficiency should only be in 3 digits like this: 0.00
            const proficiency = techniqueToInfo.proficiency.toFixed(2);

            const arr = [
                `<:black_arrow:1229396585956380715> **Name:** ${techniqueToInfo.name}`,
                `<:black_arrow:1229396585956380715> **Effect:** ${techniqueToInfo.effect}`,
                `<:black_arrow:1229396585956380715> **Unique ID** ${techniqueToInfo.uid}`,
                `<:black_arrow:1229396585956380715> **Equip:** ${techniqueToInfo.equip ? 'Yes' : 'No'}`,
                `<:black_arrow:1229396585956380715> **Type:** ${techniqueToInfo.type}`,
                `<:black_arrow:1229396585956380715> **Proficiency:** ${proficiency}`,
            ];

            const embed = new EmbedBuilder()
                .setTitle(`Technique Information`)
                .setDescription(arr.join('\n'))
                .setColor(config.color.main)
                .setTimestamp();

            return interaction.editReply({ embeds: [embed] });
        };

        if (subcommand === 'unequip') {
            const technique = interaction.options.getInteger('technique');

            if (!player.equippedTechniques.length) {
                return interaction.editReply({ embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('<:error:1229320037131882598> You do not have any equipped techniques in your inventory.')
                        .setColor(config.color.main)
                        .setTimestamp()
                ] });
            };

            const techniqueToUnequip = player.equippedTechniques.find(t => t.uid === `${technique}`);
            if (!techniqueToUnequip) {
                return interaction.editReply({ embeds: [
                    new EmbedBuilder()
                        .setTitle('Error')
                        .setDescription('<:error:1229320037131882598> You do not have this technique equipped.')
                        .setColor(config.color.main)
                        .setTimestamp()
                ] });
            };

            player.equippedTechniques = player.equippedTechniques.filter(t => t.uid !== `${technique}`);
            player.techniques.push(techniqueToUnequip);
            player.techniques.find(t => t.uid === `${technique}`).equip = false;
            await player.save();

            return interaction.editReply({ embeds: [
                new EmbedBuilder()
                    .setTitle('Technique Unequipped')
                    .setDescription(`<:black_arrow:1229396585956380715> You have unequipped the technique **${techniqueToUnequip.name}**.`)
                    .setColor(config.color.main)
                    .setTimestamp()
            ] });
        };
    }
};