const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const parkings = new Schema({
  name: {
    type: String,
    required: true
  },
  id: {
    type: Number,
    required: true
  },
  total_floors: {
    type: Number,
    required: true
  },
  total_spaces: {
    type: Number,
    required: true
  },
  total_occupied: {
    type: Number,
    required: true
  },
  total_free: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Parkings", parkings);
