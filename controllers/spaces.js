const Parkings = require("../models/Parkings");
const Floors = require("../models/Floors");
const Zones = require("../models/Zones");
const Spaces = require("../models/Spaces");
const io = require("../socket");
const mongoose = require("mongoose");
// const udp = require("../udp1");

exports.postSpace = (req, res, next) => {
  let parking_id = req.body.parking_id;
  let floor_id = req.body.floor_id;
  let zone_id = req.body.zone_id;
  let slot_name = req.body.slot_name;
  let configure = req.body.configure;
  let space_id = req.body.space_id;
  let zone_slot_id = req.body.zone_slot_id;
  let action = req.body.action;

  // console.log(zone_slot_id);
  // throw "error";
  //update space here based on space id
  if (action === "connect") {
    Spaces.find({ space_id: space_id })
      .then((space) => {
        //console.log(space);
        let spaceInfo = space[0].configure;
        if (spaceInfo == true) {
          res.status(201).send({
            message: space[0].space_name,
          });
        }
        // console.log(space.length);
        // if (!space.length > 0) {
        //   // return res.status(401).send({ message: "Space Id Not Found Or It's Already Configured" });
        //   res.status(204).send({
        //     message: "Space Id Not Found Or It's Already Configured",
        //     //data: updatedSpace
        //   });
        //}
        else {
          //update zone data too
          Zones.updateOne(
            { _id: zone_id, "slot_names._id": zone_slot_id },
            {
              $set: {
                "slot_names.$.configure": true,
                "slot_names.$.device_id": space_id,
              },
            }
          )
            .then((updatedZone) => {})
            .catch((err) => {
              console.log(err);
            });

          //update space
          Spaces.updateOne(
            { space_id: space_id },
            {
              $set: {
                floor_id: floor_id,
                zone_id: zone_id,
                space_name: slot_name,
                configure: true,
              },
            }
          )
            .then((updatedSpace) => {
              res.status(200).send({
                message: "Space Connected Successfully",
                data: updatedSpace,
              });
            })
            .catch((err) => {
              console.log(err);
            });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } else if (action === "disconnect") {
    //diconnect by space id

    //update zone data too
    Zones.updateOne(
      { _id: zone_id, "slot_names._id": zone_slot_id },
      { $set: { "slot_names.$.configure": false } }
    )
      .then((updatedZone) => {})
      .catch((err) => {
        console.log(err);
      });

    Spaces.updateOne(
      { space_id: space_id },
      {
        $set: {
          floor_id: floor_id,
          zone_id: zone_id,
          space_name: "NA",
          configure: false,
        },
      }
    )
      .then((updatedSpace) => {
        res.status(200).send({
          message: "Space Disconnected Successfully",
          data: updatedSpace,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

//get spaces
exports.getSpaces = async (req, res, next) => {
  const parkings = await Parkings.find();
  const parkings_array = [];

  for (let p = 0; p < parkings.length; p++) {
    let parking = parkings[p];
    const parking_id = parking._id;
    const parking_name = parking.name;
    const total_spaces = parking.total_spaces;
    const total_floors = parking.total_floors;
    const total_occupied = await Spaces.find({
      device_occupied: true,
      parking_id: parking_id,
    }).countDocuments();
    const total_free = total_spaces - total_occupied;

    // floor details
    const floors_array = await getFloorInfo(parking_id);

    let parking_obj = {
      parking_name: parking_name,
      total_spaces: total_spaces,
      total_floors: total_floors,
      total_occupied: total_occupied,
      total_free: total_free,
      floors: floors_array,
    };

    parkings_array.push(parking_obj);
  }

  io.getIO().emit("spaces", {
    action: "getting spaces",
    spaces: parkings_array,
  });
  return res.send(parkings_array);
};

const getFloorInfo = async (parking_id) => {
  const floors = await Floors.find({ parking_id: parking_id });
  const floors_array = [];
  for (let f = 0; f < floors.length; f++) {
    const floor = floors[f];
    const floor_id = floor._id;
    const floor_total_spaces = floor.total_spaces;
    const floor_total_zones = floor.total_zones;
    const floor_total_occupied = await Spaces.find({
      device_occupied: true,
      parking_id: parking_id,
      floor_id,
    }).countDocuments();
    const floor_total_free = floor_total_spaces - floor_total_occupied;

    // zone details
    const zones_array = await getZoneInfo(parking_id, floor_id);

    let floor_obj = {
      floor_id: floor_id,
      total_spaces: floor_total_spaces,
      total_occupied: floor_total_occupied,
      total_free: floor_total_free,
      total_zones: floor_total_zones,
      zones: zones_array,
    };

    floors_array.push(floor_obj);
  }
  return floors_array;
};

const getZoneInfo = async (parking_id, floor_id) => {
  const zones = await Zones.find({ floor_id: floor_id });
  const zones_array = [];

  for (let z = 0; z < zones.length; z++) {
    let zone = zones[z];
    const zone_id = zone._id;
    const zone_total_spaces = zone.total_spaces;
    const zone_total_occupied = await Spaces.find({
      device_occupied: true,
      parking_id: parking_id,
      floor_id: floor_id,
      zone_id: zone_id,
    }).countDocuments();
    const zone_total_free = zone_total_spaces - zone_total_occupied;

    let zone_obj = {
      zone_id: zone_id,
      total_spaces: zone_total_spaces,
      total_occupied: zone_total_occupied,
      total_free: zone_total_free,
    };

    zones_array.push(zone_obj);
  }

  return zones_array;
};

exports.getSpaceslist = async (req, res) => {
  try {
    const spacesExists = await Spaces.find();
    if (spacesExists) {
      return res.status(200).json({
        status: 200,
        message: "successfully fetched spaces",
        response: spacesExists,
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "couldnot find spaces",
        data: [],
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Unexpected server error ",
      data: [err],
    });
  }
};

exports.getSpacesByZone = async (req, res) => {
  try {
    const zoneObjID = req.params.zoneObjID;
    const zoneData = await Spaces.aggregate([
      {
        $match: {
          zone_id: new mongoose.Types.ObjectId(zoneObjID),
        },
      },
    ]);

    if (zoneData.length > 0) {
      return res.status(200).json({
        status: 200,
        message: "Spaces fetched successfully",
        data: zoneData,
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "No Spaces available",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Unexpected server error ",
      data: [err],
    });
  }
};

exports.updateSpaces = async (req, res) => {
  try {
    const { ZoneId, spaceId, FloorId, ParkingId } = req.body;

    if (!ZoneId || !FloorId || !ParkingId || !spaceId || spaceId.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    const zone = await Zones.findById(ZoneId);
    if (!zone) {
      return res
        .status(404)
        .json({ success: false, message: "Zone not found" });
    }

    let cleanedZoneName = zone.zone_name
      .replace(/\s*\(.*?\)\s*/g, "")
      .trim()
      .replace(/-$/, "");
    const { slot_names } = zone;
    let slotIndex = slot_names.length + 1;

    const newSpaces = spaceId.map((id) => {
      const slotName = `${cleanedZoneName}-${slotIndex++}`;
      return {
        zone_id: ZoneId,
        floor_id: FloorId,
        parking_id: ParkingId,
        space_id: id,
        configure: true,
        device_type: 0,
        space_name: slotName,
        space_address: "NA",
        space_ip: "0.0.0.0",
        network: "NA",
        signal_strength: 0,
        device_mode: "LIVE",
        device_occupied: true,
        low_distance: 0,
        mid_distance: 150,
        high_distance: 260,
      };
    });


    const insertedSpaces = await Spaces.insertMany(newSpaces);

    const updatedZone = await Zones.findByIdAndUpdate(
      ZoneId,
      {
        $push: {
          slot_names: {
            $each: newSpaces.map(({ space_name, space_id }) => ({
              slot_name: space_name,
              configure: true,
              device_id: space_id,
            })),
          },
        },
      },
      { new: true }
    );

    if (!updatedZone) {
      return res
        .status(404)
        .json({ success: false, message: "Zone update failed" });
    }

    // Recalculate total_spaces count
    const totalSpacesCount = updatedZone.slot_names.length;

    // Update total_spaces count in the zone
    await Zones.findByIdAndUpdate(ZoneId, { total_spaces: totalSpacesCount });

    res.status(201).json({
      success: true,
      message: "Spaces added, space names updated, and total_spaces updated",
      data: { insertedSpaces, total_spaces: totalSpacesCount },
    });
  } catch (error) {
    console.error("Error updating spaces:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add spaces",
      error: error.message,
    });
  }
};
