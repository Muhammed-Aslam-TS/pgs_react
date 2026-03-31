const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const floors = new Schema({
  floor_number: {
    type: Number,
    required: true
  },
  floor_name: {
    type: String,
    required: true
  },
  total_spaces: {
    type: Number,
    required: true
  },
  occupied: {
    type: Number,
    required: true
  },
  free: {
    type: Number,
    required: true
  },
  total_zones: {
    type: Number,
    required: true
  },
  parking_id: {
    type: Schema.Types.ObjectId,
    required: true
  }
});

module.exports = mongoose.model("Floors", floors);
