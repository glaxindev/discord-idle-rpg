// Define Mongoose schema and models
const { Schema, model } = require('mongoose');

const worldSchema = new Schema({
  locations: {
    mountain: {
        time: { type: String, default: "Morning" },
        weather: { type: String, default: "Sunny" }
    },
    forest: {
        time: { type: String, default: "Morning" },
        weather: { type: String, default: "Sunny" }
    },
    desert: {
        time: { type: String, default: "Morning" },
        weather: { type: String, default: "Sunny" }
    },
    cave: {
        time: { type: String, default: "Morning" },
        weather: { type: String, default: "Sunny" }
    },
    river: {
        time: { type: String, default: "Morning" },
        weather: { type: String, default: "Sunny" }
    },
    beach: {
        time: { type: String, default: "Morning" },
        weather: { type: String, default: "Sunny" }
    },
    village: {
        time: { type: String, default: "Morning" },
        weather: { type: String, default: "Sunny" }
    },
    castle: {
        time: { type: String, default: "Morning" },
        weather: { type: String, default: "Sunny" }
    },
    town: {
        time: { type: String, default: "Morning" },
        weather: { type: String, default: "Sunny" }
    },
    city: {
        time: { type: String, default: "Morning" },
        weather: { type: String, default: "Sunny" }
    },
  },
});

const World = model('World', worldSchema);
module.exports = World;

// Define other schemas and models as needed
