const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const zones = new Schema({
  zone_number: {
    type: Number,
    required: true
  },
  zone_name: {
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
  floor_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  parking_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  slot_names: [
    {
      slot_name: {
        type: String,
        required: true
      },
      configure: {
        type: Boolean,
        required: true
      },
      device_id: {
        type: Number,
        required: false
      }
    }
  ]
});

module.exports = mongoose.model("Zones", zones);
