const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const schema = require('../../../schemas/PlayerSchema.js');
const config = require('../../../config.js');
const { Font, RankCardBuilder } = require("canvacord");
Font.loadDefault();
const WorldSchema = require('../../../schemas/WorldSchema.js');
const worldConfig = require('../../../worldconfig.json');
const moment = require('moment');
// const Canvas = require('canvas');

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('cultivate')
        .setDescription('Cultivate and get experience points which can be used to breakthrough.'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
       await interaction.deferReply();
        const user = interaction.user;
        const player = await schema.findOne({ userId: user.id });

        if (!player)
        return interaction.reply({ embeds: [
          new EmbedBuilder()
              .setTitle('Error')
              .setDescription('<:error:1229320037131882598> You do not have a profile, please use `/start` to create a profile and start playing!')
              .setColor(config.color.main)
              .setTimestamp()
      ], ephemeral: true });

      const cultivatorsHere = await schema.find({ 'coordinates.x': player.coordinates.x, 'coordinates.y': player.coordinates.y, 'coordinates.z': player.coordinates.z, 'coordinates.zy': player.coordinates.zy });
      const cultivators = cultivatorsHere.map(cultivator => `${cultivator.username} (ID: ${cultivator.trackings.playerNumber})`).join('\n');

        const arr = [
            `> (${player.coordinates.x}, ${player.coordinates.y}, ${player.coordinates.z}, ${player.coordinates.zy})`,
            `**Cultivators: (1/5):**`,
            `${cultivators}\n`,
            `*<@${player.userId}> felt a cold breeze brushing thier face as qi channeled through thier meridians.* **+1 XP!**`,
        ];

        const remainingXp = player.cultivation.requiredExperience - player.cultivation.experience;
        const players = await schema.find({}).sort({ 'player.powerlevel': -1 }).limit(10);

        function rankPlayers(players) {

            // remove test players userType from the list
            players = players.filter(player => player.trackings.userType !== 'test');

            return players.sort((a, b) => {
                const steps = ['Entry', 'Early', 'Middle', 'Late', 'Peak', 'Lesser Perfection', 'Greater Perfection', 'Extreme Perfection'];
                const stages = ['Qi Sensing', 'Body Strengthening', 'Qi Condensation', 'Foundation Establishment', 'Core Formation'];
                const realms = ['Mortal', 'Warrior', 'Saint', 'Immortal', 'Sage', 'Celestial', 'Divine'];

                // If exp are equal, compare based on cultivation realm
                if (realms.indexOf(a.cultivation.realm) > realms.indexOf(b.cultivation.realm)) return -1;
                if (realms.indexOf(a.cultivation.realm) < realms.indexOf(b.cultivation.realm)) return 1;

                // If realms are equal, compare based on cultivation stage
                if (stages.indexOf(a.cultivation.stage) > stages.indexOf(b.cultivation.stage)) return -1;
                if (stages.indexOf(a.cultivation.stage) < stages.indexOf(b.cultivation.stage)) return 1;

                // If stages are equal, compare based on cultivation step
                if (steps.indexOf(a.cultivation.step) > steps.indexOf(b.cultivation.step)) return -1;
                if (steps.indexOf(a.cultivation.step) < steps.indexOf(b.cultivation.step)) return 1;

                if (a.powerLevel > b.powerLevel) return -1;
                if (a.powerLevel < b.powerLevel) return 1;

                if (a.cultivation.experience > b.cultivation.experience) return -1;
                if (a.cultivation.experience < b.cultivation.experience) return 1;

                // If all comparisons are equal, return 0
                return 0;
            });
        };

        const rankedPlayers = rankPlayers(players);
        const globalRank = rankedPlayers.findIndex(player => player.userId === user.id) + 1;

        const embed = new EmbedBuilder()
            .setTitle('Success!')
            .setColor(config.color.main)
            .setFooter({
                text: `Xianxia RPG V1.0.0 - Go where the flow takes you`
            })
            .addFields(
                {
                    name: `**__${player.cultivation.realm}, ${player.cultivation.step} ${player.cultivation.stage}__**`,
                    value: `**XP:** \`${player.cultivation.experience}/${player.cultivation.requiredExperience}\` | \`${remainingXp} XP\` Left`,
                    inline: true
                },
                {
                    name: `**__Ranking:__**`,
                    value: `**Local:** \`#1\` | **Global:** \`#${globalRank}\``,
                    inline: true
                }
            )
            // .setImage("https://i.pinimg.com/originals/47/2b/e3/472be3f9c7bd6d8ad6d636bb3214654b.gif")
            .setDescription(arr.join('\n'));

        const button = new ButtonBuilder()
            .setCustomId('cultivate')
            .setLabel('Repeat')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🔄');

        const button2 = new ButtonBuilder()
            .setCustomId('overview')
            .setLabel('Overview')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📖');

        const button3 = new ButtonBuilder()
            .setCustomId('move_cultivate')
            .setLabel('Move')
            .setStyle(ButtonStyle.Primary);

        const button4 = new ButtonBuilder()
            .setCustomId('traverse')
            .setLabel('Traverse')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('👼');

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select')
            .setPlaceholder('Additional Actions')
            .addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel('Rankings')
                    .setValue('rankings')
                    .setDescription('View the global rankings of all cultivators.')
                    .setEmoji('📊'),
            );

        const actionRow = new ActionRowBuilder()
            .addComponents(button, button2, button3, button4);

        const selectActionRow = new ActionRowBuilder()
            .addComponents(selectMenu);

            const RankCard = new RankCardBuilder()
                  .setDisplayName(player.username) // Big name
                  .setUsername(
                    `<${player.cultivation.realm}> ${player.cultivation.step} ${player.cultivation.stage}`
                  ) // Small name
                  .setAvatar(
                    user.displayAvatarURL({ format: "png", size: 1024 })
                  ) // user avatar
                  .setCurrentXP(player.cultivation.experience) // current xp
                  .setRequiredXP(player.cultivation.requiredExperience) // required xp
                //   .setLevel(player.level) // user level
                  .setOverlay(90) // overlay percentage. Overlay is a semi-transparent layer on top of the background
                  .setBackground(`${process.cwd()}/assets/bg.jpg`)
                  .setStyles({
                    xp: {
                      color: config.color.main,
                    },
                    username: {
                      color: config.color.main,
                    },
                    progressbar: {
                      color: config.color.main,
                    },
                  });

                const image = await RankCard.build({
                  format: "png",
                });

        embed.setImage("attachment://profile.png");
        embed.setDescription(arr.join('\n'));
        await interaction.editReply({ embeds: [embed], files: [
            new AttachmentBuilder().setName("profile.png").setFile(image)
        ], components: [actionRow, selectActionRow] });

        const filter = i => i.user.id === interaction.user.id && i.guildId === interaction.guildId && i.message.interaction.id === interaction.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            const buttonInteraction = i;
            if (i.customId === 'cultivate') {
                let exp;
                // random xp from one to five.
                // exp = Math.floor(Math.random() * 5) + 1;

                let riskOrReward;
                if (player.coordinates.y < 6 || player.coordinates.x > 8) {
                    riskOrReward = Math.random() < 0.5;
                } else {
                    riskOrReward = true;
                };

                const randomNum = Math.random();

                if (randomNum < 0.1) {
                    exp = 5;
                } else if (randomNum < 0.2) {
                    exp = 4;
                } else if (randomNum < 0.3) {
                    exp = 3;
                } else if (randomNum < 0.5) {
                    exp = 2;
                } else {
                    exp = 1;
                };


                if (player.equippedTechniques.find(technique => technique.uid === '5')) {
                    exp += 5;
                };


                // calculate xp required for next step, increases by 10% each time
                const requiredExp = Math.floor(player.cultivation.requiredExperience * 1.1);

                // if player has a technique, increase technique proficiency by 0.02 each time.


                // random from 5 to 30
                let random = Math.floor(Math.random() * 25) + 5;
                
                if (player.techniques.length > 0) {
                    player.techniques.forEach(technique => {
                        technique.proficiency += random;
                        if (technique.proficiency >= technique.requiredProficiency) {
                            technique.proficiency = 1;
                            if (technique.stage === "Basic") {
                                technique.stage = "Novice";
                                technique.requiredProficiency = 60;
                            } else if (technique.stage === "Novice") {
                                technique.stage = "Intermediate";
                                technique.requiredProficiency = 120;
                            } else if (technique.stage === "Intermediate") {
                                technique.stage = "Advanced";
                                technique.requiredProficiency = 240;
                            } else if (technique.stage === "Advanced") {
                                technique.stage = "Expert";
                                technique.requiredProficiency = 500;
                            } else if (technique.stage === "Expert") {
                                technique.stage = "Master";
                                technique.requiredProficiency = 1000;
                            } else if (technique.stage === "Master") {
                                technique.stage = "Grandmaster";
                                technique.requiredProficiency = 2000;
                            } else if (technique.stage === "Grandmaster") {
                                technique.stage = "Perfection";
                                technique.requiredProficiency = 4000;
                            } else if (technique.stage === "Perfection") {
                                technique.stage = "Transcendence";
                                technique.requiredProficiency = 8000;
                            } else if (technique.stage === "Transcendence") {
                                technique.stage = "Unity";
                                technique.requiredProficiency = 16000;
                            } else if (technique.stage === "Unity") {
                                technique.stage = "Unity";
                                technique.requiredProficiency = 16000;
                            };
                        };
                    });
                    player.markModified('techniques');
                };
                
                    player.cultivation.experience += exp;
                if (player.cultivation.experience >= player.cultivation.requiredExperience) {
                    player.cultivation.experience = 0;
                    player.cultivation.requiredExperience = requiredExp;
                    if (player.cultivation.step === "Entry") {
                        player.cultivation.step = "Early";
                    } else if (player.cultivation.step === "Early") {
                        player.cultivation.step = "Middle";
                    } else if (player.cultivation.step === "Middle") {
                        player.cultivation.step = "Late";
                    } else if (player.cultivation.step === "Late") {
                        player.cultivation.step = "Peak";
                    } else if (player.cultivation.step === "Peak") {
                        player.cultivation.step = "Lesser Perfection";
                    } else if (player.cultivation.step === "Lesser Perfection") {
                        player.cultivation.step = "Greater Perfection";
                    } else if (player.cultivation.step === "Greater Perfection") {
                        player.cultivation.step = "Extreme Perfection";
                    } else if (player.cultivation.step === "Extreme Perfection") {
                        player.cultivation.step = "Entry";
                        if (player.cultivation.stage === "Qi Sensing") {
                            player.cultivation.stage = "Body Strengthening";
                        };
                        if (player.cultivation.stage === "Body Strengthening") {
                            player.cultivation.stage = "Qi Condensation";
                        };
                        if (player.cultivation.stage === "Qi Condensation") {
                            player.cultivation.stage = "Foundation Establishment";
                        };
                        if (player.cultivation.stage === "Foundation Establishment") {
                            player.cultivation.stage = "Core Formation";
                        };
                        if (player.cultivation.stage === "Core Formation") {
                            player.cultivation.stage = "Qi Sensing";

                            if (player.cultivation.realm === "Mortal") {
                                player.cultivation.realm = "Warrior";
                            };
                            if (player.cultivation.realm === "Warrior") {
                                player.cultivation.realm = "Saint";
                            };
                            if (player.cultivation.realm === "Saint") {
                                player.cultivation.realm = "Immortal";
                            };
                            if (player.cultivation.realm === "Immortal") {
                                player.cultivation.realm = "Sage";
                            };
                            if (player.cultivation.realm === "Sage") {
                                player.cultivation.realm = "Celestial";
                            };
                            if (player.cultivation.realm === "Celestial") {
                                player.cultivation.realm = "Divine";
                            }
                        }
                    }
                };
                player.markModified('cultivation');
                await player.save();
                // await player.save();

                try {
                    buttonInteraction.deferUpdate();
                } catch {};

                const world = await WorldSchema.findOne();

                let location = player.location;

                // random time of day
                let time = world.locations[location.toLowerCase()].time;

                // random weather
                let weather = world.locations[location.toLowerCase()].weather;

                // generate text based on location time and weather
                const txt = worldConfig[location][time][weather];

                let arrDesc = [
                    `> (${player.coordinates.x}, ${player.coordinates.y}, ${player.coordinates.z}, ${player.coordinates.zy})`,
                    `**Cultivators: (1/5):**`,
                    `${cultivators}\n`,
                    `*<@${player.userId}> ${txt}* **+${exp} XP!**`,
                ];

                const newRemainingXp = player.cultivation.requiredExperience - player.cultivation.experience;
                const newPlayers = await schema.find({}).sort({ 'player.powerlevel': -1 }).limit(10);

              function newRankPlayers(players) {

            // remove test players userType from the list
            players = players.filter(player => player.trackings.userType !== 'test');

            return players.sort((a, b) => {
                const steps = ['Entry', 'Early', 'Middle', 'Late', 'Peak', 'Lesser Perfection', 'Greater Perfection', 'Extreme Perfection'];
                const stages = ['Qi Sensing', 'Body Strengthening', 'Qi Condensation', 'Foundation Establishment', 'Core Formation'];
                const realms = ['Mortal', 'Warrior', 'Saint', 'Immortal', 'Sage', 'Celestial', 'Divine'];

                // If exp are equal, compare based on cultivation realm
                if (realms.indexOf(a.cultivation.realm) > realms.indexOf(b.cultivation.realm)) return -1;
                if (realms.indexOf(a.cultivation.realm) < realms.indexOf(b.cultivation.realm)) return 1;

                // If realms are equal, compare based on cultivation stage
                if (stages.indexOf(a.cultivation.stage) > stages.indexOf(b.cultivation.stage)) return -1;
                if (stages.indexOf(a.cultivation.stage) < stages.indexOf(b.cultivation.stage)) return 1;

                // If stages are equal, compare based on cultivation step
                if (steps.indexOf(a.cultivation.step) > steps.indexOf(b.cultivation.step)) return -1;
                if (steps.indexOf(a.cultivation.step) < steps.indexOf(b.cultivation.step)) return 1;

                if (a.powerLevel > b.powerLevel) return -1;
                if (a.powerLevel < b.powerLevel) return 1;

                if (a.cultivation.experience > b.cultivation.experience) return -1;
                if (a.cultivation.experience < b.cultivation.experience) return 1;

                // If all comparisons are equal, return 0
                return 0;
            });
        };

        const newRankedPlayers = newRankPlayers(newPlayers);
        const newGlobalRank = newRankedPlayers.findIndex(player => player.userId === user.id) + 1;

                embed.setDescription(arrDesc.join('\n'));
                embed.setTitle('Success!');
                embed.setFields(
                    {
                        name: `**__${player.cultivation.realm}, ${player.cultivation.step} ${player.cultivation.stage}__**`,
                        value: `**XP:** \`${player.cultivation.experience}/${player.cultivation.requiredExperience}\` | \`${newRemainingXp} XP\` Left`,
                        inline: true
                    },
                    {
                        name: `**__Ranking:__**`,
                        value: `**Local:** \`#1\` | **Global:** \`#${newGlobalRank}\``,
                        inline: true
                    }
                );

                const RankCard = new RankCardBuilder()
                  .setDisplayName(player.username) // Big name
                  .setUsername(
                    `<${player.cultivation.realm}> ${player.cultivation.step} ${player.cultivation.stage}`
                  ) // Small name
                  .setAvatar(
                    user.displayAvatarURL({ format: "png", size: 1024 })
                  ) // user avatar
                  .setCurrentXP(player.cultivation.experience) // current xp
                  .setRequiredXP(player.cultivation.requiredExperience) // required xp
                //   .setLevel(player.level) // user level
                  .setOverlay(90) // overlay percentage. Overlay is a semi-transparent layer on top of the background
                  .setBackground(`${process.cwd()}/assets/bg.jpg`)
                  .setStyles({
                    xp: {
                      color: config.color.main,
                    },
                    username: {
                      color: config.color.main,
                    },
                    progressbar: {
                      color: config.color.main,
                    },
                  });

                const image = await RankCard.build({
                  format: "png",
                });

                await interaction.editReply({ embeds: [embed], files: [
                    new AttachmentBuilder().setName("profile.png").setFile(image)
                ], components: [actionRow, selectActionRow] });

                if (player.cultivation.step === "Peak") {
                    const breakthroughButton = new ButtonBuilder()
                        .setCustomId('breakthrough')
                        .setLabel('Breakthrough')
                        .setEmoji('🔰')
                        .setStyle(ButtonStyle.Danger);
        
                        // embed.setDescription(`<:black_arrow:1229396585956380715> You have reached the peak of your cultivation steps, click on the button below to breakthrough.`);
                        // embed.setColor("#FF0000");

                        arrDesc.push(`\n ***Breakthrough is now possible!***`);
                        arrDesc.push(`> ** Success Rate: 50% **`);
                        embed.setDescription(arrDesc.join('\n'));
                        
                        const row = new ActionRowBuilder()
                            .addComponents(button, button2, button3, button4, breakthroughButton);
        
                        interaction.editReply({ embeds: [embed], components: [row, selectActionRow] });
        
                        client.on('interactionCreate', async (buttonInteraction) => {
                            if (buttonInteraction.isButton() && buttonInteraction.customId === 'breakthrough') {
                                if (buttonInteraction.message.interaction.id !== interaction.id && buttonInteraction.user.id === user.id) {
                                    return buttonInteraction.editReply({ components: [
                                        new ActionRowBuilder().addComponents(button.setDisabled(true), button2.setDisabled(true), button3.setDisabled(true), button4.setDisabled(true)),
                                        new ActionRowBuilder().addComponents(selectMenu.setDisabled(true))
                                    ] });
                                };
                
                                if (buttonInteraction.user.id !== user.id) {
                                    return buttonInteraction.reply({ content: 'You cannot interact with this button.', ephemeral: true });
                                };

                                await buttonInteraction.deferUpdate();

                                const stepBreakthroughButton = new ButtonBuilder()
                                    .setCustomId('breakthrough_step')
                                    .setLabel('Step')
                                    .setEmoji('🔰')
                                    .setStyle(ButtonStyle.Danger);

                                    const stageBreakthroughButton = new ButtonBuilder()
                                    .setCustomId('breakthrough_stage')
                                    .setLabel('Stage')
                                    .setEmoji('🔰')
                                    .setStyle(ButtonStyle.Danger);

                                const realmBreakthroughButton = new ButtonBuilder()
                                    .setCustomId('breakthrough_realm')
                                    .setLabel('Realm')
                                    .setEmoji('🔰')
                                    .setStyle(ButtonStyle.Danger);

                                const breakthroughRow = new ActionRowBuilder()
                                    .addComponents(stepBreakthroughButton, stageBreakthroughButton, realmBreakthroughButton);

                                const breakthroughEmbed1 = new EmbedBuilder()
                                    .setTitle('Breakthrough')
                                    .setDescription(`<:black_arrow:1229396585956380715> You have reached the peak of your cultivation steps, select the breakthrough type below.`)
                                    .setColor(config.color.main);

                               await interaction.editReply({ embeds: [breakthroughEmbed1], components: [breakthroughRow], files: [] });

                               const breakthroughFilter = i => i.user.id === interaction.user.id && i.guildId === interaction.guildId;
                               const breakthroughCollector = interaction.channel.createMessageComponentCollector({ breakthroughFilter, time: 60000 });

                               breakthroughCollector.on('collect', async i => {
                                      if (!i.isButton()) return;
                                      if (i.customId !== 'breakthrough_step' && i.customId !== 'breakthrough_stage' && i.customId !== 'breakthrough_realm') return;
                                    
                                      const odds = Math.random() < 0.5;

                                      if (!odds) {
                                        await i.deferUpdate();
                                        embed.setDescription(`<:black_arrow:1229396585956380715> You have failed to breakthrough, please try again later.`);
                                        embed.setTitle('Breakthrough Failed');
                                        const newRow = new ActionRowBuilder()
                                        .addComponents(button.setDisabled(true), button2.setDisabled(true), button3.setDisabled(true), button4.setDisabled(true), breakthroughButton.setDisabled(true));
                                        const newSelectRow = new ActionRowBuilder()
                                        .addComponents(selectMenu.setDisabled(true));
                                        interaction.editReply({ embeds: [embed.setColor(config.color.main)], components: [newRow, newSelectRow] });
    
                                        // reduce cultivation exp by 10%
                                        player.cultivation.experience = Math.floor(player.cultivation.experience * 0.9);
                                        // thier strength is incerased by 10%
                                        player.stats.strength -= 2;
                                        player.markModified('cultivation');
                                        player.markModified('stats');
                                        player.save();
                                        collector.stop();
                                        breakthroughCollector.stop();
                                        return;
                                    };

                                const steps = ['Entry', 'Early', 'Middle', 'Late', 'Peak', 'Lesser Perfection', 'Greater Perfection', 'Extreme Perfection'];
                                const stages = ['Qi Sensing', 'Body Strengthening', 'Qi Condensation', 'Foundation Establishment', 'Core Formation'];
                                const realms = ['Mortal', 'Warrior', 'Saint', 'Immortal', 'Sage', 'Celestial', 'Divine'];

                                await i.deferUpdate();

                                embed.setDescription(`<:black_arrow:1229396585956380715> You are currently undergoing a breakthrough, please wait for the process to complete.`);
                                embed.setTitle('Breakthrough Ongoing');

                                const newRow = new ActionRowBuilder()
                                    .addComponents(button.setDisabled(true), button2.setDisabled(true), button3.setDisabled(true), button4.setDisabled(true), breakthroughButton.setDisabled(true));

                                const newSelectRow = new ActionRowBuilder()
                                    .addComponents(selectMenu.setDisabled(true));

                                await interaction.editReply({ embeds: [embed.setColor(config.color.main)], components: [newRow, newSelectRow] });

                                      if (i.customId === 'breakthrough_step') {
                                        // await i.deferUpdate();
                                        player.cultivation.experience = 0;
                                        player.cultivation.requiredExperience = requiredExp;
                                        if (player.cultivation.step === "Extreme Perfection") {
                                            player.cultivation.step = "Entry";
                                        } else {
                                            player.cultivation.step = steps[steps.indexOf(player.cultivation.step) + 1];
                                        };
                                        player.markModified('cultivation');
                                        await player.save();

                                        setTimeout(() => {
                                            embed.setDescription(`<:black_arrow:1229396585956380715> You have successfully breakthrough and reached the next step of your cultivation steps.`);
                                            embed.setTitle('Breakthrough Success');
                                            embed.setFields(
                                                {
                                                    name: `**__${player.cultivation.realm}, ${player.cultivation.step} ${player.cultivation.stage}__**`,
                                                    value: `**XP:** \`${player.cultivation.experience}/${player.cultivation.requiredExperience}\` | \`${remainingXp} XP\` Left`,
                                                    inline: true
                                                },
                                                {
                                                    name: `**__Ranking:__**`,
                                                    value: `**Local:** \`#1\` | **Global:** \`#${globalRank}\``,
                                                    inline: true
                                                }
                                            );
            
                                            const newRow = new ActionRowBuilder()
                                                .addComponents(button.setDisabled(true), button2.setDisabled(true), button3.setDisabled(true), button4.setDisabled(true), breakthroughButton.setDisabled(true));
            
                                            const newSelectRow = new ActionRowBuilder()
                                                .addComponents(selectMenu.setDisabled(true));
            
                                            interaction.editReply({ embeds: [embed.setColor(config.color.main)], components: [newRow, newSelectRow] });
                                            collector.stop();
                                            breakthroughCollector.stop();
                                            }, 7000);
                        
                                      } else if (i.customId === 'breakthrough_stage') {
                                        // await i.deferUpdate();
                                        player.cultivation.experience = 0;
                                        player.cultivation.requiredExperience = requiredExp;
                                        if (player.cultivation.stage === "Core Formation") {
                                            player.cultivation.stage = "Qi Sensing";
                                        } else {
                                            player.cultivation.stage = stages[stages.indexOf(player.cultivation.stage) + 1];
                                        };
                                        player.cultivation.step = "Entry";
                                        player.markModified('cultivation');
                                        await player.save();

                                        setTimeout(() => {
                                            embed.setDescription(`<:black_arrow:1229396585956380715> You have successfully breakthrough and reached the next stage of your cultivation stages.`);
                                            embed.setTitle('Breakthrough Success');
                                            embed.setFields(
                                                {
                                                    name: `**__${player.cultivation.realm}, ${player.cultivation.step} ${player.cultivation.stage}__**`,
                                                    value: `**XP:** \`${player.cultivation.experience}/${player.cultivation.requiredExperience}\` | \`${remainingXp} XP\` Left`,
                                                    inline: true
                                                },
                                                {
                                                    name: `**__Ranking:__**`,
                                                    value: `**Local:** \`#1\` | **Global:** \`#${globalRank}\``,
                                                    inline: true
                                                }
                                            );
            
                                            const newRow = new ActionRowBuilder()
                                                .addComponents(button.setDisabled(true), button2.setDisabled(true), button3.setDisabled(true), button4.setDisabled(true), breakthroughButton.setDisabled(true));
            
                                            const newSelectRow = new ActionRowBuilder()
                                                .addComponents(selectMenu.setDisabled(true));
            
                                            interaction.editReply({ embeds: [embed.setColor(config.color.main)], components: [newRow, newSelectRow] });
                                            collector.stop();
                                            breakthroughCollector.stop();
                                            }, 7000);

                                      } else if (i.customId === 'breakthrough_realm') {
                                        // await i.deferUpdate();
                                        player.cultivation.experience = 0;
                                        player.cultivation.requiredExperience = requiredExp;
                                        if (player.cultivation.realm === "Divine") {
                                            player.cultivation.realm = "Mortal";
                                        } else {
                                            player.cultivation.realm = realms[realms.indexOf(player.cultivation.realm) + 1];
                                        };
                                        player.cultivation.step = "Entry";
                                        player.markModified('cultivation');
                                        await player.save();

                                        setTimeout(() => {
                                            embed.setDescription(`<:black_arrow:1229396585956380715> You have successfully breakthrough and reached the next realm of your cultivation realms.`);
                                            embed.setTitle('Breakthrough Success');
                                            embed.setFields(
                                                {
                                                    name: `**__${player.cultivation.realm}, ${player.cultivation.step} ${player.cultivation.stage}__**`,
                                                    value: `**XP:** \`${player.cultivation.experience}/${player.cultivation.requiredExperience}\` | \`${remainingXp} XP\` Left`,
                                                    inline: true
                                                },
                                                {
                                                    name: `**__Ranking:__**`,
                                                    value: `**Local:** \`#1\` | **Global:** \`#${globalRank}\``,
                                                    inline: true
                                                }
                                            );
            
                                            const newRow = new ActionRowBuilder()
                                                .addComponents(button.setDisabled(true), button2.setDisabled(true), button3.setDisabled(true), button4.setDisabled(true), breakthroughButton.setDisabled(true));
            
                                            const newSelectRow = new ActionRowBuilder()
                                                .addComponents(selectMenu.setDisabled(true));
            
                                            interaction.editReply({ embeds: [embed.setColor(config.color.main)], components: [newRow, newSelectRow] });
                                            collector.stop();
                                            breakthroughCollector.stop();
                                            }, 7000);
                                            
                                      };
                               });
                            }
                        });
                };
            } else if (i.customId === 'overview') {
                await buttonInteraction.deferUpdate();

                const arrDesc = `> The Cultivate Command empowers players to enhance their characters' abilities and progress through stages and realms. Players accumulate experience points through gameplay and invest them to cultivate their characters. Upon reaching the peak step of a stage, players can undergo breakthroughs, unlocking higher stages and realms while gaining significant power boosts. This mechanic fosters strategic decision-making, a sense of achievement, and community interaction, enriching the overall gaming experience.`;

                embed.setDescription(arrDesc);
                embed.setTitle('Cultivation Overview');
                embed.setFields([]);

                const newRow = new ActionRowBuilder()
                    .addComponents(button.setDisabled(true), button2.setDisabled(true), button3.setDisabled(true), button4.setDisabled(true));

                const newSelectRow = new ActionRowBuilder()
                    .addComponents(selectMenu.setDisabled(true));

                return interaction.editReply({ embeds: [embed], components: [newRow, newSelectRow], files: [] });
            } else if (i.customId === 'traverse') {
                await buttonInteraction.deferUpdate();
                
                if (player.cultivation.traverse.traversed) {

                    const newRow = new ActionRowBuilder()
                    .addComponents(button.setDisabled(true), button2.setDisabled(true), button3.setDisabled(true), button4.setDisabled(true));

                    const newSelectRow = new ActionRowBuilder()
                    .addComponents(selectMenu.setDisabled(true));

                    if (Date.now() < player.cultivation.traverse.cooldown) {
                        const remainingTime = moment(player.cultivation.traverse.cooldown).format("X");
                        return interaction.editReply({
                            embeds: [new EmbedBuilder().setTitle('Traverse').setDescription(`> You have already traversed realms recently, you can traverse again <t:${remainingTime}:R>.`).setColor(config.color.main)],
                            components: [newRow, newSelectRow],
                            files: []
                        });
                    };

                    player.cultivation.traverse.traversed = false;
                    player.cultivation.realm = player.cultivation.traverse.oldRealm;
                    player.cultivation.traverse.oldRealm = 'None';
                    // 1 hour cooldown
                    player.cultivation.traverse.cooldown = Date.now() + 3600000;
                    player.markModified('cultivation');
                    await player.save();

                    const embed1 = new EmbedBuilder()
                        .setTitle('Traverse')
                        .setDescription(`> You have successfully traversed back to your original realm.`)
                        .setColor(config.color.main);

                    return interaction.editReply({ embeds: [embed1], components: [newRow, newSelectRow], files: [] });
                } else {
                    const realms = ['Mortal', 'Warrior', 'Saint', 'Immortal', 'Sage', 'Celestial', 'Divine'];
                    const currentRealmIndex = realms.indexOf(player.cultivation.realm);
                    const newRealmIndex = currentRealmIndex + 1;
                    const newRealm = realms[newRealmIndex];

                    const newRow = new ActionRowBuilder()
                    .addComponents(button.setDisabled(true), button2.setDisabled(true), button3.setDisabled(true), button4.setDisabled(true));

                    const newSelectRow = new ActionRowBuilder()
                    .addComponents(selectMenu.setDisabled(true));

                    if (player.cultivation.traverse.cooldown > Date.now()) {
                        const remainingTime = moment(player.cultivation.traverse.cooldown).format("X");
                        return interaction.editReply({
                            embeds: [new EmbedBuilder().setTitle('Traverse').setDescription(`> You have already traversed realms recently, you can traverse again <t:${remainingTime}:R>.`).setColor(config.color.main)],
                            components: [newRow, newSelectRow],
                            files: []
                        });
                    };

                    if (newRealm === 'Divine') {
                        return interaction.editReply({
                            embeds: [new EmbedBuilder().setTitle('Traverse').setDescription(`> You have reached the highest realm, there is nowhere else to traverse.`).setColor(config.color.main)],
                            components: [newRow, newSelectRow],
                            files: []
                        });
                    };

                    player.cultivation.traverse.traversed = true;
                    player.cultivation.traverse.oldRealm = player.cultivation.realm;
                    player.cultivation.realm = newRealm;
                    // 1 hour cooldown
                    player.cultivation.traverse.cooldown = Date.now() + 3600000;
                    player.markModified('cultivation');
                    await player.save();

                    const embed2 = new EmbedBuilder()
                        .setTitle('Traverse')
                        .setDescription(`> You have successfully traversed to the next realm: **${newRealm}**.`)
                        .setColor(config.color.main);

                    return interaction.editReply({ embeds: [embed2], components: [newRow, newSelectRow], files: [] });
                };
            } else if (i.customId === 'select') {
                await buttonInteraction.deferUpdate()
                if (i.values[0] === 'rankings') {
                    await buttonInteraction.editReply({ components: [], embeds: [], files: [], content: 'Loading leaderboard...' });
                    return client.collection.interactioncommands.get('leaderboard').run(client, buttonInteraction);
                }
            } else if (i.customId === "move_cultivate") {
                try {
                    await buttonInteraction.deferUpdate();
                } catch {};
                const embed = new EmbedBuilder()
                  .setTitle("Movement")
                  .setDescription(
                    "Please use the buttons below to move to the desired coordinates."
                  )
                  .setColor(config.color.main)
                  .addFields({
                    name: "Coordinates",
                    value: `(${player.coordinates.x},${player.coordinates.y},${player.coordinates.z},${player.coordinates.zy})`,
                  });

                const actionRow = new ActionRowBuilder().addComponents(
                  new ButtonBuilder()
                    .setCustomId("left")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("<:left:1235449810849497130>"),
                  new ButtonBuilder()
                    .setCustomId("up")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("<:WhiteUp:1235450108527644743>"),
                  new ButtonBuilder()
                    .setCustomId("down")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("<:WhiteDown:1235450176819167293>"),
                  new ButtonBuilder()
                    .setCustomId("right")
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji("<:rightarrow:1235449899965874196>")
                );

               let msg = await i.channel.send({
                    embeds: [embed],
                    components: [actionRow],
                    files: [],
                    ephemeral: true,
               }).catch(() => {});

                collector.stop();
                interaction.deleteReply();

                collector.removeListener("collect", () => {});

                const filter2 = (i2) => i2.user.id === interaction.user.id;
                const collector2 =
                  interaction.channel.createMessageComponentCollector({
                    filter2,
                    time: 60000,
                  });

                collector2.on("collect", async (i2) => {
                await i2.deferUpdate();
                  if (i2.customId === "left") {
                    player.coordinates.x -= 1;
                    player.coordinates.zy -= 1;
                  } else if (i2.customId === "up") {
                    player.coordinates.y += 1;
                  } else if (i2.customId === "down") {
                    player.coordinates.y -= 1;
                  } else if (i2.customId === "right") {
                    player.coordinates.x += 1;
                    player.coordinates.zy += 1;
                  }

                  await player.save();

                  const embed = new EmbedBuilder()
                    .setTitle("Movement")
                    .setDescription(
                      "Please use the buttons below to move to the desired coordinates."
                    )
                    .setColor(config.color.main)
                    .addFields({
                      name: "Coordinates",
                      value: `(${player.coordinates.x},${player.coordinates.y},${player.coordinates.z},${player.coordinates.zy})`,
                    });

                  await msg.edit({
                    embeds: [embed],
                    components: [actionRow],
                  });

                  collector2.resetTimer();
                });

                collector2.on("end", async () => {
                  return msg.edit({
                    embeds: [embed],
                    components: [
                      new ActionRowBuilder().addComponents(
                        actionRow.components.map((component) =>
                          component.setDisabled(true)
                        )
                      ),
                    ],
                  });
                });
            };
        });
    },
};
