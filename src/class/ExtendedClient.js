const { Client, Partials, Collection, GatewayIntentBits } = require("discord.js");
const config = require(`${process.cwd()}/src/config.js`);
const commands = require(`${process.cwd()}/src/handlers/commands.js`);
const events = require(`${process.cwd()}/src/handlers/events.js`);
const deploy = require(`${process.cwd()}/src/handlers/deploy.js`);
const mongoose = require(`${process.cwd()}/src/handlers/mongoose.js`);
const components = require(`${process.cwd()}/src/handlers/components.js`);
const { ClusterClient, getInfo } = require('discord-hybrid-sharding');

module.exports = class extends Client {
    collection = {
        interactioncommands: new Collection(),
        prefixcommands: new Collection(),
        aliases: new Collection(),
        components: {
            buttons: new Collection(),
            selects: new Collection(),
            modals: new Collection(),
            autocomplete: new Collection()
        },
    };
    applicationcommandsArray = [];
    cluster = new ClusterClient(this);

    constructor() {
        super({
            intents: 3276799, // Every intent
            partials: [
                Partials.Channel,
                Partials.GuildMember,
                Partials.Message,
                Partials.Reaction,
                Partials.User,
                Partials.ThreadMember
            ],
            shards: getInfo().SHARD_LIST, // An array of shards that will get spawned
            shardCount: getInfo().TOTAL_SHARDS, // Total number of shards
        });
    };

    start = async () => {
        commands(this);
        events(this);
        components(this);

        if (config.handler.mongodb.enabled) mongoose();

        await this.login(process.env.CLIENT_TOKEN || config.client.token);

        if (config.handler.deploy) deploy(this, config);
    };
};