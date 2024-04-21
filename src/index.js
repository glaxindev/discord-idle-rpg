require('dotenv').config();
const ExtendedClient = require(`${process.cwd()}/src/class/ExtendedClient.js`);

const client = new ExtendedClient();

client.start();

// Handles errors and avoids crashes, better to not remove them.
process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);