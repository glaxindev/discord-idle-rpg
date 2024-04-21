const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, AttachmentBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient');
const schema = require('../../../schemas/PlayerSchema.js');
const config = require('../../../config.js');
const { Font, RankCardBuilder } = require("canvacord");
Font.loadDefault();

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('cultivate')
        .setDescription('Cultivate and get experience points which can be used to breakthrough.'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
       await interaction.deferReply({ ephemeral: false });
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

        const arr = [
            `*You had a fruitful cultivation session.*`,
            `\n`,
            `**Rewards:**`,
            `+12 xp`,
        ];

        const embed = new EmbedBuilder()
            .setTitle('Cultivate')
            .setColor(config.color.main)
            .setTimestamp()
            .setDescription(arr.join('\n'));

        const button = new ButtonBuilder()
            .setCustomId('cultivate')
            .setLabel('Cultivate')
            .setStyle(ButtonStyle.Success);

        const actionRow = new ActionRowBuilder()
            .addComponents(button);

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
                  .setBackground(
                    "https://w0.peakpx.com/wallpaper/849/4/HD-wallpaper-minimal-blackgreen-material-led-light-simple-black-dark-green-design.jpg"
                  ) // set background color or,
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
        interaction.editReply({ embeds: [embed], files: [
            new AttachmentBuilder().setName("profile.png").setFile(image)
        ], components: [actionRow] });

        client.on('interactionCreate', async (buttonInteraction) => {
            if (buttonInteraction.isButton() && buttonInteraction.customId === 'cultivate') {
                // generate random exp from 10 to 80
                let exp;
                if (player.cultivation.step === "Entry" || player.cultivation.step === "Early" || player.cultivation.step === "Middle") {
                exp = Math.floor(Math.random() * 60) + 10;
                } else {
                exp = Math.floor(Math.random() * 30) + 10;
                };


                if (player.equippedTechniques.find(technique => technique.uid === '5')) {
                    exp += 10;
                };


                // calculate xp required for next step, increases by 10% each time
                const requiredExp = Math.floor(player.cultivation.requiredExperience * 1.1);

                // if player has a technique, increase technique proficiency by 0.02 each time.
                let random;
                if (player.techniques.length > 0) {
                    player.techniques.forEach(technique => {
                        technique.proficiency += 0.02;
                    });
                    player.markModified('techniques');
                    await player.save();
                };

                player.cultivation.experience += exp;
                if (player.cultivation.experience >= requiredExp) {
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
                // await player.save();

                await buttonInteraction.deferUpdate();

                const arrDesc = [
                    `*You had a fruitful cultivation session.*`,
                    `\n`,
                    `**Rewards:**`,
                    `- +${exp} xp`,
                ];

                if (player.equippedTechniques.find(technique => technique.uid === '5')) {
                    arrDesc.push(`\n`);
                    arrDesc.push(`**Techniques Used**`);
                    arrDesc.push(`- Breath of Enlightenment +10 xp`);
                };

                if (player.techniques.length > 0) {
                    arrDesc.push(`\n`);
                    arrDesc.push(`**Technique Proficiency:**`);
                    player.techniques.forEach(technique => {
                        arrDesc.push(`- ${technique.name} +0.02`);
                    });
                };

                embed.setDescription(arrDesc.join('\n'));
                embed.setTitle('Cultivation Successful');

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
                  .setBackground(
                    "https://w0.peakpx.com/wallpaper/849/4/HD-wallpaper-minimal-blackgreen-material-led-light-simple-black-dark-green-design.jpg"
                  ) // set background color or,
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
                ], components: [actionRow] });

                await player.save();

                if (player.cultivation.step === "Peak") {
                    const breakthroughButton = new ButtonBuilder()
                        .setCustomId('breakthrough')
                        .setLabel('Breakthrough')
                        .setStyle(ButtonStyle.Danger);
        
                        // embed.setDescription(`<:black_arrow:1229396585956380715> You have reached the peak of your cultivation steps, click on the button below to breakthrough.`);
                        // embed.setColor("#FF0000");

                        arrDesc.push(`\n`);
                        arrDesc.push(`***Breakthrough is now possible!***`);
                        embed.setDescription(arrDesc.join('\n'));
                        
                        const row = new ActionRowBuilder()
                            .addComponents(button, breakthroughButton);
        
                        interaction.editReply({ embeds: [embed], components: [row] });
        
                        client.on('interactionCreate', async (buttonInteraction) => {
                            if (buttonInteraction.isButton() && buttonInteraction.customId === 'breakthrough') {
                                const steps = ['Entry', 'Early', 'Middle', 'Late', 'Peak', 'Lesser Perfection', 'Greater Perfection', 'Extreme Perfection'];
                                const stages = ['Qi Sensing', 'Body Strengthening', 'Qi Condensation', 'Foundation Establishment', 'Core Formation'];
                                const realms = ['Mortal', 'Warrior', 'Saint', 'Immortal', 'Sage', 'Celestial', 'Divine'];

                                player.cultivation.experience = 0;
                                player.cultivation.requiredExperience = requiredExp;
                                if (player.cultivation.stage === "Qi Sensing") {
                                    player.cultivation.stage = "Body Strengthening";
                                    player.cultivation.step = "Entry";
                                } else if (player.cultivation.stage === "Body Strengthening") {
                                    player.cultivation.stage = "Qi Condensation";
                                    player.cultivation.step = "Entry";
                                } else if (player.cultivation.stage === "Qi Condensation") {
                                    player.cultivation.stage = "Foundation Establishment";
                                    player.cultivation.step = "Entry";
                                } else if (player.cultivation.stage === "Foundation Establishment") {
                                    player.cultivation.stage = "Core Formation";
                                    player.cultivation.step = "Entry";
                                } else if (player.cultivation.stage === "Core Formation") {
                                    player.cultivation.stage = "Qi Sensing";
                                    player.cultivation.step = "Entry";
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
                                };
                                
        
                                await buttonInteraction.deferUpdate();

                                embed.setDescription(`<:black_arrow:1229396585956380715> You are currently undergoing a breakthrough, please wait for the process to complete.`);
                                embed.setTitle('Breakthrough Ongoing');


                                const newRow = new ActionRowBuilder()
                                    .addComponents(button.setDisabled(true), breakthroughButton.setDisabled(true));

                                interaction.editReply({ embeds: [embed.setColor(config.color.main)], components: [newRow] });
        
                                setTimeout(() => {
                                embed.setDescription(`<:black_arrow:1229396585956380715> You have successfully breakthrough and reached the next stage of your cultivation steps.`);
                                embed.setTitle('Breakthrough Successful');


                                const newRow = new ActionRowBuilder()
                                    .addComponents(button.setDisabled(true), breakthroughButton.setDisabled(true));

                                interaction.editReply({ embeds: [embed.setColor(config.color.main)], components: [newRow] });
                                }, 7000);

                                 player.save();
                            }
                        });
                };
            }
        });
    }
};
