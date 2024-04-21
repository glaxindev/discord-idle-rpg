const { Client, Partials, Collection, GatewayIntentBits, ActivityType } = require("discord.js");
const config = require(`${process.cwd()}/src/config.js`);
const commands = require(`${process.cwd()}/src/handlers/commands.js`);
const events = require(`${process.cwd()}/src/handlers/events.js`);
const deploy = require(`${process.cwd()}/src/handlers/deploy.js`);
const mongoose = require(`${process.cwd()}/src/handlers/mongoose.js`);
const components = require(`${process.cwd()}/src/handlers/components.js`);

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
            presence: {
                status: "idle",
                activities: [{
                    name: "with your mind",
                    type: ActivityType.Playing
                }]
            }
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