require('dotenv').config();
const ExtendedClient = require(`${process.cwd()}/src/class/ExtendedClient.js`);

const client = new ExtendedClient();

client.start();

// Handles errors and avoids crashes, better to not remove them.
// process.on('unhandledRejection', console.error);
// process.on('uncaughtException', console.error);

process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

// bot should auto restart when a crash occurs
process.on('exit', () => {
    require('child_process').spawn(process.argv.shift(), process.argv, {
      cwd: process.cwd(),
      detached: true,
      stdio: 'inherit',
    });
    process.exit();
});