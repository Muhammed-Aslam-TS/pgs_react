var mongoose = require("mongoose")
var Schema = mongoose.Schema;

const parkingArrayObj= new Schema({
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
  })
  
  const parkingByDayObj = new Schema({
   time:{
     type:String,
     required:true
   },
   parkingArray:[parkingArrayObj]
  
  });
  
  const parkingsReport = new Schema({
    day: {
      type: Number,
      required: true
    },
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    parkingByDay :[parkingByDayObj]
  });




module.exports = mongoose.model("ParkingReports",parkingsReport);