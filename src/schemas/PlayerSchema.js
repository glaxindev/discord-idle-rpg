// Define Mongoose schema and models
const { Schema, model } = require('mongoose');
const config = require('../config.js');

const playerSchema = new Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  inventory: { type: Array, default: [] },
  powerlevel: { type: Number, default: 200 },
  cultivation: {
    step: { type: String, default: 'Entry' },
    stage: { type: String, default: 'Qi Sensing' },
    realm: { type: String, default: 'Mortal' },
    experience: { type: Number, default: 0 },
    requiredExperience: { type: Number, default: 100 },
    traverse: {
      traversed: { type: Boolean, default: false },
      oldRealm: { type: String, default: 'None' },
      cooldown: { type: Date, default: Date.now() },
    },
  },
  equippedItems: { type: Array, default: [] },
  stats: {
    strength: { type: Number, default: 10 },
    agility: { type: Number, default: 10 },
    endurance: { type: Number, default: 10 },
    fortune: { type: Number, default: 10 },
    wisdom: { type: Number, default: 10 },
  },
  money: { type: Number, default: 100 },
  techniques: { type: Array, default: [] },
  equippedTechniques: { type: Array, default: [] },
  trackings: {
    startedPlaying: { type: Date, default: Date.now() },
    lastAction: { type: Date, default: Date.now() },
    totalActions: { type: Number, default: 0 },
    userType: { type: String, default: 'player' },
    playerNumber: { type: Number, default: 0 },
    commandsUsage: {
      stats: { type: Number, default: 0 },
      commands: { type: Number, default: 0 },
      inventory: { type: Number, default: 0 },
      journey: { type: Number, default: 0 },
      profile: { type: Number, default: 0 },
      start: { type: Number, default: 0 },
      techniques: { type: Number, default: 0 },
      leaderboard: { type: Number, default: 0 },
      challenge: { type: Number, default: 0 },
      cultivate: { type: Number, default: 0 },
    },
  },
  cooldown: {
    lastCommand: { type: Date, default: Date.now() },
  },
  location: { type: String, default: 'Mountain' },
  journeyMovementCount: { type: Number, default: 0 },
  coordinates: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
    zy: { type: Number, default: 0 },
  },
});

const Player = model('Player', playerSchema);
module.exports = Player;

// Define other schemas and models as needed
