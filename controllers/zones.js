const Zones = require("../models/Zones");
// const Parkings = require("../models/Parkings");
const Floors = require("../models/Floors");
const Spaces = require("../models/Spaces");
const app = require("../app");
// const mongoose = require("mongoose");

exports.postZones = (req, res, next) => {
  const zone_numbers = req.body.zone_numbers;
  const zone_names = req.body.zone_names;
  const total_spaces = req.body.total_spaces;
  const floor_id = req.body.floor_id;
  const parking_id = req.body.parking_id;

  let zones = [];
  for (let z = 0; z < zone_numbers.length; z++) {
    let zone_number = zone_numbers[z];
    let zone_name = zone_names[z];
    let total_space = total_spaces[z];

    slot_names = [];

    for (let s = 1; s <= total_space; s++) {
      let slot_name = zone_name + "-" + s;
      let configure = false;

      let slot_obj = {
        slot_name: slot_name,
        configure: configure,
        device_id: 0,
      };
      slot_names.push(slot_obj);
    }

    let zone = {
      zone_number: zone_number,
      zone_name: zone_name,
      total_spaces: total_space,
      occupied: 0,
      free: total_space,
      floor_id: floor_id,
      parking_id: parking_id,
      slot_names: slot_names

    };

    zones.push(zone);
  }

  //inserting zones
  Zones.insertMany(zones)
    .then(zonesResult => {
      res
        .status(200)
        .send({ message: "zones inserted successfully", data: zonesResult });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getZones = (req, res, next) => {
  const floor_id = req.params.floor_id;
  Zones.find({ floor_id: floor_id })
    .then(zones => {
      // console.log(zones);
      res.status(200).send({ message: "zone data", data: zones });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getZone = (req, res, next) => {
  const zone_id = req.params.zone_id;

  Zones.find({ _id: zone_id })
    .then(zone => {
      //console.log(zone);
      let parking_id = null;
      let floor_id = zone[0].floor_id;
      // console.log("floor_id", floor_id);c
      Floors.find({ _id: floor_id }).then(floor => {
        // console.log("floor", floor);
        parking_id = floor[0].parking_id;
        // console.log(parking_id);
        //get all unconfigured spaces here
        Spaces.find({
          configure: false,
          parking_id: parking_id
        }).then(spaces => {
          // console.log(spaces);
          zone.push({ spaces: spaces });

          res.status(200).send({ message: "Zone Data", data: zone });
        });
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getZonesByParking = async (req, res, next) => {
  const parking_id = req.params.parking_id;

  let zones_data = [];
  //get floors
  const floors = await Floors.find({ parking_id: parking_id });
  for (let f = 0; f < floors.length; f++) {
    let floor_id = floors[f]._id;
    let zones = await Zones.find({ floor_id: floor_id });

    zones_data.push(zones);
  }

  if (zones_data !== 0) {
    res
      .status(200)
      .send({ message: "Zones Data By Parking Id", data: zones_data });
  } else {
    res.status(403).send({ message: "Something went wrong!!!" });
  }
};

exports.getZoneSpacesCount = async (req, res, next) => {

  //app.io.emit('dashboard', 'hello from server');
  // const parking_id = req.params.parking_id;
  const floor_id = req.params.floor_id;

  let zone_spaces = [];
  //get zone ids by floor_id in Zone

  const zones = await Zones.find({ floor_id: floor_id });

  const floor = await Floors.find({ _id: floor_id });

  for (let i = 0; i < zones.length; i++) {

    let zone_id = zones[i]._id;
    let zone_name = zones[i].zone_name;
    let total_spaces = zones[i].total_spaces;

    const count = await Spaces.countDocuments({
      zone_id: zone_id,
      // device_status: false
      device_occupied: false
    });

    let spaceObj = {
      zone_id: zone_id,
      zone_name: zone_name,
      total_spaces: total_spaces,
      available: count,
      occupied: total_spaces - count
    };
    zone_spaces.push(spaceObj);
  }

  if (zone_spaces.length !== 0) {

    res.status(200).send({ message1: "Zone Spaces Data", floor_name: floor[0].floor_name, floor_id: floor[0]._id, total_spaces: floor[0].total_spaces, occupied: floor[0].occupied, free: floor[0].free, data: zone_spaces });
  } else {
    res.status(401).send({ message: "Something Went Wrong" });
  }
};
