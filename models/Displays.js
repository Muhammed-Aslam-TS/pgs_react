const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const displays = new Schema({
  parking_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  display_name: {
    type: String,
    required: true
  },
  display_type: {
    type: String,
    required: true
  },
  display_id: {
    type: Number,
    required: true
  },
  display_address: {
    type: String,
    required: true,
    default: "NA"
  },
  display_ipaddress: {
    type: String,
    required: true,
    default: "0.0.0.0"
  },
  display_network: {
    type: String,
    required: true,
    default: "NA"
  },
  display_signal_strength: {
    type: Number,
    required: true,
    default: 0
  },
  display_request: {
    type: String,
    required: true,
    default: "NA"
  },
  current_value: {
    type: Number,
    required: true,
    default: 0
  },
  display_connections_id: [mongoose.Types.ObjectId],
  display_connections_name: [{ type: String }]
});

module.exports = mongoose.model("Displays", displays);
