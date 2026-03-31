const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const spaces = new Schema({
  parking_id: {
    type: Schema.Types.ObjectId,
    required: true,
    default: null
  },
  floor_id: {
    type: Schema.Types.ObjectId,
    required: true,
    default: null
  },
  zone_id: {
    type: Schema.Types.ObjectId,
    required: true,
    default: null
  },
  configure: {
    type: Boolean,
    required: true,
    default: false
  },
  device_type: {
    type: Number,
    required: true,
    default: 0
  },
  space_id: {
    type: Number,
    required: true,
    unique: true,
    default: 0,
},
  space_name: {
    type: String,
    requried: true,
    default: "NA"
  },
  space_address: {
    type: String,
    required: true,
    default: "NA"
  },
  space_ip: {
    type: String,
    required: true,
    default: "0.0.0.0"
  },
  network: {
    type: String,
    required: true,
    default: "NA"
  },
  signal_strength: {
    type: Number,
    required: true,
    default: 0
  },
  device_mode: {
    type: String,
    required: true,
    default: "NA"
  },
  device_occupied: {
    type: Boolean,
    required: true,
    default: 0
  },
  low_distance: {
    type: Number,
    required: true,
    default: 0
  },
  mid_distance: {
    type: Number,
    required: true,
    default: 0
  },
  high_distance: {
    type: Number,
    required: true,
    default: 0
  }
});

module.exports = mongoose.model("Spaces", spaces);
