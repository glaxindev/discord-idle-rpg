const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const schema = require('../../../schemas/PlayerSchema.js');
const config = require('../../../config.js');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('challenge')
        .setDescription('Challenge a user to battle, no penalty if you lose.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user you want to challenge.')
                .setRequired(true)),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        // Mentioned user is autobattled, turn based but no user interaction, decisions are automatically made. No rewards or penalties for winning or losing.
        const user = interaction.options.getUser('user');
        const challenger = await schema.findOne({ userId: interaction.user.id });
        const challenged = await schema.findOne({ userId: user.id });



    if (!challenger || !challenged) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Error")
              .setDescription(
                "<:error:1229320037131882598> You or the target do not have a profile, please use `/start` to create a profile and start playing!"
              )
              .setColor(config.color.main)
              .setTimestamp(),
          ],
          ephemeral: true,
        });
       };

    if (challenger.userId === challenged.userId) {
        return interaction.reply({
            content: 'You cannot challenge yourself to a battle!',
        })
       };

       if (!challenger.powerlevel >= 200) {
        return interaction.reply({
            content: 'You need a power rating of 200 to challenge someone to a battle!',
        });
       };  

       if (!challenger.stats.strength >= 10) {
        return interaction.reply({
            content: 'You need a strength of 10 to challenge someone to a battle!',
        });
       };

      let winner;
      if (challenger.equippedTechniques.find(technique => technique.uid === '6')) {
        winner = challenger;
        challenger.equippedTechniques.find(technique => technique.uid === '6').proficiency += 0.02;
        await challenger.save();
      } else {
        winner = challenged;
      };

      if (challenger.equippedTechniques.find(technique => technique.uid === '2')) {
        winner = challenger;
        if (challenger.stats.strength >= 5) {
          challenger.stats.strength -= 5;
        };
        challenger.equippedTechniques.find(technique => technique.uid === '2').proficiency += 0.02;
        await challenger.save();
      } else {
        winner = challenged;
      };

      if (challenger.stats.strength >= 5) {
        winner = challenger;
        challenger.stats.strength -= 5;
        await challenger.save();
      } else {
        winner = challenged;
      };

      if (challenger.equippedTechniques.find(tech => tech.uid === '5')) {
        challenger.stats.strength += 5;
        await challenger.save();
      };

      if (challenger.equippedTechniques.find(tech => tech.uid === '1')) {
        challenger.stats.agility += 5;
        challenger.stats.strength -= 5;
        await challenger.save();
      };

      if (challenger.stats.wisdom >= 5) {
        winner = challenger;
        challenger.stats.wisdom -= 5;
        await challenger.save();
      } else {
        winner = challenged;
      };
      
      const embed1 = new EmbedBuilder()
        .setTitle('Battle Challenge')
        .setDescription(`You have challenged ${user.username} to a battle!`)
        .setColor(config.color.main)
        .setTimestamp();

       await interaction.reply({ embeds: [embed1] });

       setTimeout(() => {

        const arr = [
            `<:black_arrow:1229396585956380715> **${challenger.username}** vs **${challenged.username}**`,
            `\n`,
        ];

           const embed = new EmbedBuilder()
               .setTitle('Battle Challenge')
               .setDescription(arr.join('\n'))
               .setColor(config.color.main)
               .setTimestamp();
           interaction.editReply({ embeds: [embed] });

           
         arr.push(`<:battle:1231202621897838723> Strength Analyzed`);
        embed.setDescription(arr.join('\n'));
        interaction.editReply({ embeds: [embed] });
        setTimeout(() => {
             arr.push(`<:battle:1231202621897838723> Skills Used`);
            embed.setDescription(arr.join('\n'));
            interaction.editReply({ embeds: [embed] });
        }, 1000);
        setTimeout(() => {
            arr.push(`<:battle:1231202621897838723> Battle Started`);
           embed.setDescription(arr.join('\n'));
           interaction.editReply({ embeds: [embed] });
        }, 2000);
        setTimeout(() => {
             arr.push(`<:battle:1231202621897838723> Battle Ended`);
            embed.setDescription(arr.join('\n'));
            interaction.editReply({ embeds: [embed] });
        }, 5000);

         }, 2000);

        setTimeout(() => {
            const embed2 = new EmbedBuilder()
                .setTitle('Challenge')
                .setDescription(`**${winner.userId === challenger.userId ? challenger.username : challenged.username}** has won the battle!`)
                .setColor(config.color.main)
                .setTimestamp();
            interaction.editReply({ embeds: [embed2] });
        }, 10000);
    }
};
