const config = require("../../config");
const { log } = require("../../functions");
const ExtendedClient = require("../../class/ExtendedClient");

// const cooldown = new Map();
const moment = require("moment");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    event: "interactionCreate",
    /**
     *
     * @param {ExtendedClient} client
     * @param {import('discord.js').Interaction} interaction
     * @returns
     */
    run: async (client, interaction) => {
        if (!interaction.isCommand()) return;

        if (
            config.handler.commands.slash === false &&
            interaction.isChatInputCommand()
        )
            return;
        if (
            config.handler.commands.user === false &&
            interaction.isUserContextMenuCommand()
        )
            return;
        if (
            config.handler.commands.message === false &&
            interaction.isMessageContextMenuCommand()
        )
            return;

        const command = client.collection.interactioncommands.get(
            interaction.commandName
        );

        if (!command) return;
        // await interaction.reply({ content: "Processing...", ephemeral: true });

        const Player = require('../../schemas/PlayerSchema.js');
        let player = await Player.findOne({ userId: interaction.user.id });

        if (!player) {
            await Player.create({
              userId: interaction.user.id,
              username: interaction.user.tag,
            });
            player = await Player.findOne({ userId: interaction.user.id });
          };

        if (player) {
            player.trackings.lastAction = Date.now();
            player.trackings.totalActions++;
            if (player.trackings.playerNumber === 0) {
                player.trackings.playerNumber = await Player.countDocuments();
            };
            player.trackings.commandsUsage[interaction.commandName]++;
            await player.save();
        };


        // // leveling

        // const Player = require("../../schemas/PlayerSchema.js");

        // const calculateXPRequired = (level) => {
        //     // Base XP required for level 1
        //     let xpRequired = 1000;
        //     // Calculate XP required for subsequent levels
        //     for (let i = 2; i <= level; i++) {
        //       xpRequired += xpRequired * 0.1; // Increase by 10% each level
        //     }
        //     // remove decimals points
        //     return Math.floor(xpRequired);
        //   };
          

        // // Function to give XP to a user
        // async function giveXP(userId, amount) {
        //   try {
        //     const player = await Player.findOne({ userId });
        //     if (!player) return console.error("Player not found.");

        //     player.currentXp += amount;
        //     if (player.currentXp >= player.requiredXp) {
        //       player.currentXp = player.currentXp - player.requiredXp;
        //       player.requiredXp = calculateXPRequired(player.level + 2);
        //       levelUp(player);
        //     }
        //     await player.save();

        //   } catch (error) {
        //     console.error(error);
        //   }
        // };

        // // Function to level up a user
        // async function levelUp(player) {
        //   try {
        //     if (player.level === 100) return;

        //     player.level++;
        //     // player.powerlevel += 80;
        //     player.currentXp = 0 // Reset XP to 0 after leveling up
        //     player.requiredXp = calculateXPRequired(player.level + 2);
        //     player.stats.strength = 10
        //     player.stats.agility = 10
        //     player.stats.endurance = 10
        //     player.stats.fortune = 10
        //     player.stats.wisdom = 10


        //     await player.save();

        //     // Notify the user about their level up

        //     const user = await client.users.fetch(player.userId);
        //     const { EmbedBuilder } = require('discord.js');
        //     let embed = new EmbedBuilder()
        //     .setTitle('Level Up')
        //     .setDescription(`<:black_arrow:1229396585956380715> Congratulations ${user.username}! You have leveled up to level ${player.level}!`)
        //     .setColor(config.color.main)
        //     .setTimestamp();

        //     user.send({embeds: [embed]});

        //     // Notify the user about their level up
        //     // const user = await client.users.fetch(player.userId);
        //     // user.send(`Congratulations! You have leveled up to level ${player.level}!`);
        //   } catch (error) {
        //     console.error(error);
        //   }
        // }

        // // increase xp by 20 per command usage and level up if xp is greater than 1000
        // const player2 = await Player.findOne({ userId: interaction.user.id });
        // if (player2 && player2.level < 20) {
        //     giveXP(interaction.user.id, 30);
        // } else {
        //     giveXP(interaction.user.id, 10);
        // };

        try {
            if (command.options?.ownerOnly) {
                if (interaction.user.id !== config.users.ownerId) {
                    await interaction.reply({
                        content:
                            config.messageSettings.ownerMessage !== undefined &&
                                config.messageSettings.ownerMessage !== null &&
                                config.messageSettings.ownerMessage !== ""
                                ? config.messageSettings.ownerMessage
                                : "The bot developer has the only permissions to use this command.",
                        ephemeral: true
                    });

                    return;
                }
            }

            if (command.options?.developers) {
                if (
                    config.users?.developers?.length > 0 &&
                    !config.users?.developers?.includes(interaction.user.id)
                ) {
                    await interaction.reply({
                        content:
                            config.messageSettings.developerMessage !== undefined &&
                                config.messageSettings.developerMessage !== null &&
                                config.messageSettings.developerMessage !== ""
                                ? config.messageSettings.developerMessage
                                : "You are not authorized to use this command",
                        ephemeral: true,
                    });

                    return;
                } else if (config.users?.developers?.length <= 0) {
                    await interaction.reply({
                        content:
                            config.messageSettings.missingDevIDsMessage !== undefined &&
                                config.messageSettings.missingDevIDsMessage !== null &&
                                config.messageSettings.missingDevIDsMessage !== ""
                                ? config.messageSettings.missingDevIDsMessage
                                : "This is a developer only command, but unable to execute due to missing user IDs in configuration file.",

                        ephemeral: true,
                    });

                    return;
                }
            }

            if (command.options?.nsfw && !interaction.channel.nsfw) {
                await interaction.reply({
                    content:
                        config.messageSettings.nsfwMessage !== undefined &&
                            config.messageSettings.nsfwMessage !== null &&
                            config.messageSettings.nsfwMessage !== ""
                            ? config.messageSettings.nsfwMessage
                            : "The current channel is not a NSFW channel",

                    ephemeral: true,
                });

                return;
            }


            if (interaction.isCommand) {
                const lastUsed = player.cooldown.lastCommand;
                const currentTime = Date.now();
                const difference = currentTime - lastUsed;
                const remaining = 8000 - difference;

                if (difference < 8000) {
                    const remainingTime = moment(remaining + 1).format("s [seconds]");
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`<:error:1229320037131882598> You need to wait ${remainingTime} before using this command again.`)
                                .setColor("#FF0000")
                        ],
                        ephemeral: false,
                    });

                    // edit the time each second
                    const interval = setInterval(async () => {
                        const remaining = 8000 - (Date.now() - player.cooldown.lastCommand);
                        if (remaining <= 0) {
                            clearInterval(interval);
                            await interaction.editReply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setDescription('<:loading:1233741223399915522> Your cooldown has ended and you can now use the command!')
                                        .setColor(config.color.main)
                                ]
                            });
                            return;
                        }

                        await interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(`<:error:1229320037131882598> You need to wait ${moment(remaining + 1).format("s [seconds]")} before using this command again.`)
                                    .setColor("#FF0000")
                            ]
                        });
                    }, 1000);

                    // setTimeout(async () => {
                    //     await interaction.deleteReply();
                    // }, remaining + 1000);

                    return;
                }

                player.cooldown.lastCommand = currentTime;
                await player.save();
            }

            // await interaction.deleteReply();
            command.run(client, interaction);
        } catch (error) {
            log(error, "err");
        }
    },
};