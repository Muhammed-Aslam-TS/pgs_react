const Parkings = require("../models/Parkings");
const Spaces = require("../models/Spaces");
const Floors = require("../models/Floors");
const mongodb = require("mongodb");
const ObjectId = mongodb.ObjectID;
const app = require("../app");
const ParkingReportSchema = require("../models/ParkingReports");
//scheduler

const schedule = require("node-schedule");

const rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = [new schedule.Range(0, 23), new schedule.Range(8, 23)];
// rule.hour = [new schedule.Range(0,3),new schedule.Range(8,23)];
rule.minute = new schedule.Range(0, 59, 5);

const createReport = schedule.scheduleJob(rule, async function () {
  // console.log('The answer to life, the universe, and everything!');
  const ParkingData = await Parkings.find();
  // console.log(ParkingData);

  const currentDateTime = new Date();
  //  console.log(currentDateTime);
  const currentDay = currentDateTime.getDate();
  const currentMonth = currentDateTime.getMonth() + 1;
  const currentYear = currentDateTime.getFullYear();
  function timeFormat(time) {
    if (time < 10) {
      return "0" + time;
    } else {
      return time;
    }
  }
  const currentTime =
    currentDateTime.getHours() + ":" + timeFormat(currentDateTime.getMinutes());
  const parkingDataExists = await ParkingReportSchema.findOne({
    $and: [{ day: currentDay }, { month: currentMonth }, { year: currentYear }],
  });

  if (!parkingDataExists) {
    parkingByDay = {
      time: currentTime.toString(),
      parkingArray: ParkingData,
    };

    parkData = {
      day: currentDay,
      month: currentMonth,
      year: currentYear,
      parkingByDay: [parkingByDay],
    };
    const parkingReportSave = new ParkingReportSchema(parkData);
    // console.log(account);
    parkingReportSave.save();
  } else {
    parkingByDay = {
      time: currentTime.toString(),
      parkingArray: ParkingData,
    };
    const parkingDataExists = await ParkingReportSchema.findOneAndUpdate(
      {
        $and: [
          { day: currentDay },
          { month: currentMonth },
          { year: currentYear },
        ],
      },
      {
        $push: {
          parkingByDay: parkingByDay,
        },
      }
    );
  }

  const socketGraphData = await ParkingReportSchema.findOne({
    $and: [{ day: currentDay }, { month: currentMonth }, { year: currentYear }],
  });

  app.io.emit("graph", socketGraphData);
});

//post parkings
exports.postParkings = (req, res, next) => {


  console.log("ivde varnd____________________");
  console.log("ivde varnd____________________");
  console.log("ivde varnd____________________");
  console.log("ivde varnd____________________");
  
  const parking_ids = req.body.parking_ids;
  const parking_names = req.body.parking_names;
  const floors = req.body.floors;
  const spaces = req.body.spaces;

  const objects = [];
  // const slots = []; // [{ [{},{},{}...   ]  }],{},{}]

  for (let i = 0; i < parking_names.length; i++) {
    let obj = {
      name: parking_names[i],
      id: parking_ids[i],
      total_floors: floors[i],
      total_spaces: spaces[i],
      total_occupied: 0,
      total_free: spaces[i],
    };
    objects.push(obj);
  }

  // console.log(objects);

  Parkings.insertMany(objects)
    .then((result) => {
      console.log(result);

      result.map((key, index) => {
        parking_id = key._id;
        id = key.id;
        total_spaces = key.total_spaces;
        let starter = id * 10000000;
        let ender = starter + total_spaces;

        let slots = [];

        for (let slot = starter + 1; slot <= ender; slot++) {
          //insert slots here
          let slot_obj = {
            parking_id: parking_id,
            floor_id: new ObjectId(),
            zone_id: new ObjectId(),
            space_id: slot,
          };
          slots.push(slot_obj);
        }

        Spaces.insertMany(slots);
      });

      res.status(200).send({ message: "Parkings Inserted Successfully!!!" });
    })
    .catch((err) => {
      console.log(err);
    });
};

//get parkings
exports.getParkings = (req, res, next) => {
  Parkings.find()
    .then(async (parkings) => {
      const currentDateTime = new Date();
      const currentDay = currentDateTime.getDate();
      const currentMonth = currentDateTime.getMonth() + 1;
      const currentYear = currentDateTime.getFullYear();
      const GraphData = await ParkingReportSchema.findOne({
        $and: [
          { day: currentDay },
          { month: currentMonth },
          { year: currentYear },
        ],
      });
      res
        .status(200)
        .send({
          message: "All Parkings",
          data: parkings,
          graphData: GraphData,
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

//get floors for parkings
exports.getFloors = async (req, res, next) => {  
  const parking_id = await req.params.parking_id;
  let floor_obj = [];
  let count = await Floors.countDocuments({
    parking_id: parking_id,
  });
  if (count > 0) {
    const floor = Floors.find({ parking_id: parking_id }, (err, result) => {
      //console.log(result);
      if (err) throw err;
      Parkings.find({ _id: parking_id })
        .then((parking) => {
          res
            .status(200)
            .send({
              message: "Parking Data",
              configured_floors: count,
              spaces: parking[0].total_spaces,
              floors_data: result,
              data: parking,
            });
        })
        .catch((err) => {
          console.log(err);
        });
      // console.log(count);
    });
  } else {
    console.log("zero");
    Parkings.find({ _id: parking_id })
      .then((parking) => {
        res
          .status(200)
          .send({
            message: "Parking Data",
            configured_floors: count,
            data: parking,
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
