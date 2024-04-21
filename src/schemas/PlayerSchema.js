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
  techniques: { type: Array, default: [
    config.techniques[5],
  ] },
  equippedTechniques: { type: Array, default: [] },
});

const Player = model('Player', playerSchema);
module.exports = Player;

// Define other schemas and models as needed
