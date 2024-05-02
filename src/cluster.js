const { ClusterManager } = require('discord-hybrid-sharding');
const config = require('./config.js');
const { log } = require('./functions.js');

const manager = new ClusterManager(`${process.cwd()}/src/index.js`, {
    totalShards: 'auto', // or numeric shard count
    /// Check below for more options
    shardsPerClusters: 2, // 2 shards per process
    // totalClusters: 7,
    mode: 'process', // you can also choose "worker"
    token: config.client.token,
});

manager.on('clusterCreate', cluster => log(`Successfully Launched Cluster ${cluster.id}!`, 'done'));
manager.spawn({ timeout: -1 });