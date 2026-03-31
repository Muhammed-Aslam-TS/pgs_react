const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DetectEventObj = new Schema({
    deviceID :{
        type:String,
        required:true
    },
    detectionType:{
        type:String,
        required:true,
    },
    startTime:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
        // required:true
    },
    endTime:{
        type:String,
        // required:true
    }
})

const SpaceEvents = new Schema({
    day:{
        type:Number,
        required:true
    },
    month:{
        type:Number,
        required:true
    },
    year:{
        type:Number,
        required:true
    },
    DetectEvents:[DetectEventObj]
})

module.exports = mongoose.model("SpaceEvents",SpaceEvents)