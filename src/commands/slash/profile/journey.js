const { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ExtendedClient = require('../../../class/ExtendedClient.js');
const config = require('../../../config.js');
const { itemTypes } = config;

module.exports = {
    structure: new SlashCommandBuilder()
        .setName('journey')
        .setDescription('Go on a journey and encounter various events along the way!'),
    /**
     * @param {ExtendedClient} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction, levelUp) => {
        const Player = require('../../../schemas/PlayerSchema.js');

        const playerid = Player.findOne({ userId: interaction.user.id });
        if (!playerid) {
            return interaction.reply({ embeds: [
                new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription('<:error:1229320037131882598> You do not have a profile, please use `/start` to create a profile and start playing!')
                    .setColor(config.color.main)
                    .setTimestamp()
            ], ephemeral: true });
        };

        let allEvents = [
            { 
              description: 'You encounter a wounded beast on the path, its eyes pleading for help.', 
              options: ['Approach cautiously and attempt to heal it.', 'Ignore the creature and continue your journey.'],
              consequences: [
                { alignmentChange: 10, xpChange: 50 },
                { alignmentChange: -10, xpChange: 20, strengthChange: -7 }
              ]
            },
            { 
              description: 'A mysterious scroll lies half-buried in the dirt, emanating a faint glow.', 
              options: ['Read the scroll and attempt to decipher its meaning.', 'Leave the scroll undisturbed.'],
              consequences: [
                { alignmentChange: 5, xpChange: 30 },
                { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
              ]
            },
            // Add more events here
            { 
              description: 'A celestial alignment occurs, granting temporary boons to those who embrace its energy.', 
              options: ['Meditate and channel the celestial energy.', 'Ignore the alignment and continue your journey.'],
              consequences: [
                { alignmentChange: 15, xpChange: 100 },
                { alignmentChange: -5, xpChange: 50, strengthChange: -3 }
              ]
            },
            { 
              description: 'A rival cultivator challenges you to a battle of wits, seeking to test your resolve.', 
              options: ['Accept the challenge and engage in a battle of wits.', 'Decline the challenge and walk away.'],
              consequences: [
                { alignmentChange: 10, xpChange: 80 },
                { alignmentChange: -10, xpChange: 0, strengthChange: -4 }
              ]
            },
            { 
              description: 'A mysterious figure offers you a forbidden elixir, promising untold power in exchange for a price.', 
              options: ['Accept the elixir and embrace its power.', 'Refuse the elixir and walk away.'],
              consequences: [
                { alignmentChange: -10, xpChange: 100 },
                { alignmentChange: 5, xpChange: 0, strengthChange: -5 }
              ]
            },
            { 
              description: 'A hidden treasure chest lies in the shadows, waiting to be discovered by a brave adventurer.', 
              options: ['Open the chest and claim its contents.', 'Leave the chest undisturbed.'],
              consequences: [
                { alignmentChange: 5, xpChange: 50 },
                { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
              ]
            },
            { 
              description: 'A powerful storm descends upon the land, threatening to destroy everything in its path.', 
              options: ['Brace yourself and weather the storm.', 'Seek shelter and wait for the storm to pass.'],
              consequences: [
                { alignmentChange: 0, xpChange: 50 },
                { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
              ]
            },
            { 
              description: 'A mysterious portal opens before you, leading to an unknown realm beyond.', 
              options: ['Step through the portal and explore the unknown realm.', 'Ignore the portal and continue your journey.'],
              consequences: [
                { alignmentChange: 10, xpChange: 80 },
                { alignmentChange: -10, xpChange: 0, strengthChange: -7 }
              ]
            },
            { 
              description: 'A wise sage offers you a chance to glimpse into the future, revealing the path that lies ahead.', 
              options: ['Accept the sage\'s offer and peer into the future.', 'Decline the sage\'s offer and forge your own path.'],
              consequences: [
                { alignmentChange: 5, xpChange: 50 },
                { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
              ]
            },
            { 
              description: 'A mysterious figure offers you a chance to rewrite your past, erasing your mistakes and starting anew.', 
              options: ['Accept the figure\'s offer and rewrite your past.', 'Decline the figure\'s offer and embrace your mistakes.'],
              consequences: [
                { alignmentChange: -10, xpChange: 100 },
                { alignmentChange: 5, xpChange: 0, strengthChange: -7 }
              ]
            },
            { 
              description: 'A hidden treasure chest lies in the shadows, waiting to be discovered by a brave adventurer.', 
              options: ['Open the chest and claim its contents.', 'Leave the chest undisturbed.'],
              consequences: [
                { alignmentChange: 5, xpChange: 50 },
                { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
              ]
            },
            { 
              description: 'A powerful storm descends upon the land, threatening to destroy everything in its path.', 
              options: ['Brace yourself and weather the storm.', 'Seek shelter and wait for the storm to pass.'],
              consequences: [
                { alignmentChange: 0, xpChange: 50 },
                { alignmentChange: 0, xpChange: 0, strengthChange: -7 }
              ]
            },
            { 
              description: 'A mysterious portal opens before you, leading to an unknown realm beyond.', 
              options: ['Step through the portal and explore the unknown realm.', 'Ignore the portal and continue your journey.'],
              consequences: [
                { alignmentChange: 10, xpChange: 80 },
                { alignmentChange: -10, xpChange: 0, strengthChange: -7 }
              ]
            },
            { 
              description: 'A wise sage offers you a chance to glimpse into the future, revealing the path that lies ahead.', 
              options: ['Accept the sage\'s offer and peer into the future.', 'Decline the sage\'s offer and forge your own path.'],
              consequences: [
                { alignmentChange: 5, xpChange: 50 },
                { alignmentChange: 0, xpChange: 0, strengthChange: -5 }
              ]
            },
            { 
              description: 'A mysterious figure offers you a chance to rewrite your past, erasing your mistakes and starting anew.', 
              options: ['Accept the figure\'s offer and rewrite your past.', 'Decline the figure\'s offer and embrace your mistakes.'],
              consequences: [
                { alignmentChange: -10, xpChange: 100 },
                { alignmentChange: 5, xpChange: 0, strengthChange: -2 }
              ]
            }
          ];
          
          // Function to generate a random item
          const generateRandomItem = () => {
            const randomIndex = Math.floor(Math.random() * itemTypes.length);
            return itemTypes[randomIndex];
          };

          const member = await Player.findOne({ userId: interaction.user.id });

          if (member.stats.fortune === 10) {
            allEvents = [
              { 
                description: 'A mysterious figure offers you a chance to rewrite your past, erasing your mistakes and starting anew.', 
                options: ['Accept the figure\'s offer and rewrite your past.', 'Decline the figure\'s offer and embrace your mistakes.'],
                consequences: [
                  { alignmentChange: -10, xpChange: 80 },
                  { alignmentChange: 5, xpChange: 10, strengthChange: -3 }
                ]
              },
              { 
                description: 'A hidden treasure chest lies in the shadows, waiting to be discovered by a brave adventurer.', 
                options: ['Open the chest and claim its contents.', 'Leave the chest undisturbed.'],
                consequences: [
                  { alignmentChange: 5, xpChange: 80 },
                  { alignmentChange: 0, xpChange: 10, strengthChange: -7 }
                ]
              },
            ];

            member.stats.fortune = 0;
            await member.save();
          };



          // choose a random event from the events array
          const event = allEvents[Math.floor(Math.random() * allEvents.length)];

          const arrDescription = [
            `<:black_arrow:1229396585956380715> **${event.description}**`,
            `\n`,
            `<:black_arrow:1229396585956380715> **1.** ${event.options[0]}`,
            `\n`,
            `<:black_arrow:1229396585956380715> **2.** ${event.options[1]}`,
          ];

          const eventEmbed = new EmbedBuilder()
            .setTitle('Journey')
            .setDescription(arrDescription.join('\n'))
            .setColor(config.color.main)
            .setTimestamp();
            // .setFooter('Choose wisely...');

            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('option1')
                .setLabel(`Option 1`)
                .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                .setCustomId('option2')
                .setLabel(`Option 2`)
                .setStyle(ButtonStyle.Secondary)
            );

            await interaction.reply({
                embeds: [eventEmbed],
                components: [row]
            });

            const filter = i => i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

            collector.on('collect', async i => {
                if (i.customId === 'option1') {
                    

                    const choice = 0;
                    const consequence = event.consequences[choice];


                    const player = await Player.findOne({ userId: interaction.user.id });
                    // if (!player) return console.error('Player not found.');

                    player.cultivation.experience += consequence.xpChange;


            const newItem = generateRandomItem();


            // generate a random technique from config.techniques and give it to player if he doesn't have it
            
            const generateRandomTechnique = () => {
              // 2% chance to get a technique
              if (Math.random() < 0.02) {
                const randomIndex = Math.floor(Math.random() * config.techniques.length);
                return config.techniques[randomIndex];
              } else {
                return null;
              }
            };

            const newTechnique = generateRandomTechnique();

            if (newTechnique !== null && !player.techniques.some(technique => technique.name === newTechnique.name)) {
              player.techniques.push(newTechnique);
            };


            // if player has this item already, then increase the quantity
            
            if (player.inventory.some(item => item.name === newItem.name)) {
              const itemIndex = player.inventory.findIndex(item => item.name === newItem.name);
              player.inventory[itemIndex].quantity += 1;
            } else {
              player.inventory.push(newItem);
            };

            if (newItem.rarity === 'Legendary' || newItem.rarity === 'Mythical' || newItem.rarity === 'Mystical') {
              player.powerlevel += 30;
            };

                    // Apply alignment change and other consequences

                    await player.save();

                    const gotTechniqueOrItem = newTechnique ? `a **${newTechnique.name}** technique` : `a **${newItem.rarity} ${newItem.name}**`;

                    await i.update({ embeds: [
                        new EmbedBuilder()
                            .setTitle('Journey')
                            .setDescription(`<:black_arrow:1229396585956380715> You have chosen to **${event.options[choice]}** and got ${consequence.xpChange} xp points and ${gotTechniqueOrItem}!`)
                            .setColor(config.color.main)
                            .setTimestamp()
                    ], components: [] });
                    await i.deferUpdate();




                } else if (i.customId === 'option2') {
                    const choice = 1;
                    const consequence = event.consequences[choice];


                    const player = await Player.findOne({ userId: interaction.user.id });
                    // if (!player) return console.error('Player not found.');

                    player.cultivation.experience += consequence.xpChange;

                    const newItem = generateRandomItem();
                    // player.inventory.push(newItem);
                    if (player.inventory.some(item => item.name === newItem.name)) {
                      const itemIndex = player.inventory.findIndex(item => item.name === newItem.name);
                      player.inventory[itemIndex].quantity += 1;
                    } else {
                      player.inventory.push(newItem);
                    };
                    // Apply alignment change and other consequences

                    if (newItem.rarity === 'Legendary' || newItem.rarity === 'Mythical' || newItem.rarity === 'Mystical') {
                      player.powerlevel += 20;
                    };

                    // remove all strength points that user have
                    player.stats.strength = 0;
                    await player.save();

                    await i.update({ embeds: [
                        new EmbedBuilder()
                            .setTitle('Journey')
                            .setDescription(`<:black_arrow:1229396585956380715> You have chosen to **${event.options[choice]}** and lost all strength points and got a **${newItem.rarity} ${newItem.name}**!`)
                            .setColor(config.color.main)
                            .setTimestamp()
                    ], components: [] });
                    await i.deferUpdate();
                }
            });

            collector.on('end', async collected => {
                await interaction.editReply({ content: 'This interaction has ended!', components: [] });
            });
    }
};