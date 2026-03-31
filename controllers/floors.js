const Floors = require("../models/Floors");
const Zones = require("../models/Zones");
const Parking = require("../models/Parkings");

exports.postFloors = (req, res, next) => {
  const floor_numbers = req.body.floor_numbers;
  const floor_names = req.body.floor_names;
  const total_spaces = req.body.total_spaces;
  const total_zones = req.body.total_zones;
  const parking_id = req.body.parking_id;

  const floors = [];

  for (let f = 0; f < floor_numbers.length; f++) {
    let floor_number = floor_numbers[f];
    let floor_name = floor_names[f];
    let total_space = total_spaces[f];
    let total_zone = total_zones[f];

    let flr = {
      floor_number: floor_number,
      floor_name: floor_name,
      total_spaces: total_space,
      occupied: 0,
      free: total_space,
      total_zones: total_zone,
      parking_id: parking_id

    };

    floors.push(flr);
  }

  Floors.insertMany(floors)
    .then(floorResult => {
      res
        .status(200)
        .send({ message: "Floors inserted successfully", data: floorResult });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getFloors = (req, res, next) => {
  const parking_id = req.params.parking_id;

  Floors.find({ parking_id: parking_id })
    .then(floors => {
      res
        .status(200)
        .send({ message: "All Floors By Parking Id", data: floors });
    })
    .catch(err => {
      console.log(err);
      // res
      //   .status(201)
      //   .send({ message: "No floors found" });
    });
};

exports.getAllFloors = (req, res, next) => {
  Floors.find()
    .then(floors => {
      res
        .status(200)
        .send({ message: "All Floors", data: floors });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getZones = (req, res, next) => {
  const floor_id = req.params.floor_id;

  Floors.find({ _id: floor_id })
    .then(floor => {
      res.status(200).send({ message: "floor data", data: floor });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getFloorSpace = async (req, res, next) => {

  const parking_id = req.params.parking_id;
  let floorSpaces = [];

  //const zoneDetails = await Zones.find({ parking_id: parking_id })
  //console.log(zoneDetails);
  const ParkingDetails = await Parking.find({ _id: parking_id });

  const floorDetails = await Floors.find({ parking_id: parking_id });
  console.log(ParkingDetails);

  for (let z = 0; z < floorDetails.length; z++) {
    const zoneDetails = await Zones.find({ floor_id: floorDetails[z]._id });

    let flr = {
      floor_id: floorDetails[z]._id,
      floor_number: floorDetails[z].floor_number,
      floor_name: floorDetails[z].floor_name,
      total_spaces: floorDetails[z].total_spaces,
      occupied: floorDetails[z].occupied,
      free: floorDetails[z].free,
      total_zones: floorDetails[z].total_zones,
      parking_id: floorDetails[z].parking_id,
      zone_details: zoneDetails
    };
    //console.log(flr)
    floorSpaces.push(flr)
  }

  res.status(200).send({ message: "Parking Spaces", parking_data: ParkingDetails, floor_data: floorSpaces })



}



