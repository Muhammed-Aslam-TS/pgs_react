var dgram = require("dgram");
var server = dgram.createSocket("udp4");
const { Buffer } = require("buffer");
const Spaces = require("../models/Spaces");
const Zones = require("../models/Zones.js");
const mongoose = require("mongoose");
const schedule = require("node-schedule");

var PORT = 20118;
// var HOST = "192.168.1.53";
// var HOST = "localhost";
var HOST = "192.168.1.28";

exports.startCommandUdp = () => {
  server.bind(PORT, HOST);
  server.on("listening", function () {
    var address = server.address();
    console.log(
      "Command UDP Server listening on " + address.address + ":" + address.port,
    );
  });
};

const refreshStatus = async function () {
  try {
    const detectedSpaces = await Spaces.aggregate([
      {
        $match: {
          configure: true,
          device_occupied: true,
          device_mode: "LIVE",
        },
      },
    ]);

    if (detectedSpaces.length > 0) {
      new Promise((resolve, reject) => {
        detectedSpaces.forEach((element, i) => {
          setTimeout(
            function () {
              //   let message = Buffer.from(""+i+"-");
              let message = Buffer.from("Q");

              server.send(message, 20107, element.space_ip, (err, bytes) => {});

              if (i === detectedSpaces.length - 1) resolve();
            },
            200 * i, // delay 200 milliSeconds
          );
        });
      });
    }
  } catch (error) {}
};

const refreshStatusRule1 = new schedule.RecurrenceRule();
refreshStatusRule1.hour = [8];
refreshStatusRule1.minute = [43];
const refreshStatus1 = schedule.scheduleJob(refreshStatusRule1, refreshStatus);

exports.refreshOnRestart = async () => {
  try {
    const _spaces = await Spaces.aggregate([
      {
        $match: {
          configure: true,
          device_mode: "LIVE",
          space_ip: {
            $ne: ["$space_ip", "0.0.0.0"],
          },
        },
      },
    ]);

    if (_spaces.length > 0) {
      new Promise((resolve, reject) => {
        _spaces.forEach((element, i) => {
          setTimeout(
            function () {
              //   let message = Buffer.from(""+i+"-");
              let message = Buffer.from("Q");

              server.send(message, 20107, element.space_ip, (err, bytes) => {});

              if (i === _spaces.length - 1) resolve();
            },
            600 * i, // delay 200 milliSeconds
          );
        });
      });
    }
  } catch (error) {}
};

exports.blockSpaceBySpace = async (req, res) => {
  try {
    const spaceObjID = req.body.spaceObjID;
    const spaceData = await Spaces.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(spaceObjID),
        },
      },
    ]);
    // console.log(spaceData + '1234')

    if (spaceData.length == 1) {
      let message = Buffer.from("R");

      server.send(message, 20107, spaceData[0].space_ip, (err, bytes) => {
        //   if(err){
        //     console.log("error")
        //   }else{
        //     console.log("bytes"+ bytes)
        //   }
      });

      return res.status(200).json({
        status: 200,
        message: "Successfully blocked space",
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "No Space available",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Unexpected server error ",
    });
  }
};

exports.locateOnSpaceBySpace = async (req, res) => {
  try {
    const spaceObjID = req.body.spaceObjID;
    const spaceData = await Spaces.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(spaceObjID),
        },
      },
    ]);
    // console.log(spaceData + '1234')

    if (spaceData.length == 1) {
      let message = Buffer.from("R");

      server.send(message, 20107, spaceData[0].space_ip, (err, bytes) => {
        //   if(err){
        //     console.log("error")
        //   }else{
        //     console.log("bytes"+ bytes)
        //   }
      });

      return res.status(200).json({
        status: 200,
        message: "Successfully located space",
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "No Space available",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Unexpected server error ",
    });
  }
};

exports.blockSpacesByZone = async (req, res) => {
  try {
    const zoneObjID = req.body.zoneObjID;
    const zoneData = await Spaces.aggregate([
      {
        $match: {
          zone_id: new mongoose.Types.ObjectId(zoneObjID),
        },
      },
    ]);

    if (zoneData.length > 0) {
      var promiseUntilExecutes = new Promise((resolve, reject) => {
        zoneData.forEach((element, i) => {
          setTimeout(
            function () {
              //   let message = Buffer.from(""+i+"-");
              let message = Buffer.from("R");

              server.send(message, 20107, element.space_ip, (err, bytes) => {
                //   if(err){
                //     console.log("error")
                //   }else{
                //     console.log("bytes"+ bytes)
                //   }
              });

              if (i === zoneData.length - 1) resolve();
            },
            200 * i, // delay 200 milliSeconds
          );
        });
      });
      promiseUntilExecutes.then(() => {
        return res.status(200).json({
          status: 200,
          message: "Successfully blocked zone",
        });
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
    });
  }
};

exports.blockSpacesByFloor = async (req, res) => {
  try {
    const floorObjID = req.body.floorObjID;
    const floorData = await Spaces.aggregate([
      {
        $match: {
          floor_id: new mongoose.Types.ObjectId(floorObjID),
        },
      },
    ]);

    if (floorData.length > 0) {
      var promiseUntilExecutes = new Promise((resolve, reject) => {
        floorData.forEach(async (element, i) => {
          setTimeout(function () {
            let message = Buffer.from("R");
            server.send(message, 20107, element.space_ip, (err) => {
              // client.close();
              console.log("close: ");
            });
            if (i === floorData.length - 1) resolve();
          }, 200 * i); // delay 200 milliSeconds
        });
      });
      promiseUntilExecutes.then(() => {
        return res.status(200).json({
          status: 200,
          message: "Successfully blocked zone",
        });
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "No zone available",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Unexpected server error ",
    });
  }
};

exports.blockSpacesByParking = async (req, res) => {
  try {
    const parkingObjID = req.body.parkingObjID;
    const parkData = await Spaces.aggregate([
      {
        $match: {
          parking_id: new mongoose.Types.ObjectId(parkingObjID),
        },
      },
    ]);

    if (parkData.length > 0) {
      var promiseUntilExecutes = new Promise((resolve, reject) => {
        parkData.forEach(async (element, i) => {
          setTimeout(function () {
            let message = Buffer.from("R");
            server.send(message, 20107, element.space_ip, (err) => {
              // client.close();
            });
            if (i === parkData.length - 1) resolve();
          }, 200 * i); // delay 200 milliSeconds
        });
      });
      promiseUntilExecutes.then(() => {
        return res.status(200).json({
          status: 200,
          message: "Successfully blocked parking",
        });
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "No parking available",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Unexpected server error ",
    });
  }
};

exports.unBlockSpaceBySpace = async (req, res) => {
  try {
    const spaceObjID = req.body.spaceObjID;
    const spaceData = await Spaces.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(spaceObjID),
        },
      },
    ]);

    if (spaceData.length == 1) {
      let message = Buffer.from("L");

      server.send(message, 20107, spaceData[0].space_ip, (err, bytes) => {
        //   if(err){
        //     console.log("error")
        //   }else{
        //     console.log("bytes"+ bytes)
        //   }
      });

      return res.status(200).json({
        status: 200,
        message: "Successfully unblocked space",
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
    });
  }
};

exports.locateOffSpaceBySpace = async (req, res) => {
  try {
    const spaceObjID = req.body.spaceObjID;
    const spaceData = await Spaces.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(spaceObjID),
        },
      },
    ]);

    if (spaceData.length == 1) {
      let message = Buffer.from("L");

      server.send(message, 20107, spaceData[0].space_ip, (err, bytes) => {
        //   if(err){
        //     console.log("error")
        //   }else{
        //     console.log("bytes"+ bytes)
        //   }
      });

      return res.status(200).json({
        status: 200,
        message: "Successfully unblocked space",
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
    });
  }
};

exports.unBlockSpacesByZone = async (req, res) => {
  try {
    const zoneObjID = req.body.zoneObjID;
    const zoneData = await Spaces.aggregate([
      {
        $match: {
          zone_id: new mongoose.Types.ObjectId(zoneObjID),
        },
      },
    ]);

    if (zoneData.length > 0) {
      var promiseUntilExecutes = new Promise((resolve, reject) => {
        zoneData.forEach(async (element, i) => {
          setTimeout(function () {
            let message = Buffer.from("L");
            server.send(message, 20107, element.space_ip, (err) => {
              // client.close();
            });
            if (i === zoneData.length - 1) resolve();
          }, 200 * i); // delay 200 milliSeconds
        });
      });
      promiseUntilExecutes.then(() => {
        return res.status(200).json({
          status: 200,
          message: "Successfully unblocked zone",
        });
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "No zone available",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Unexpected server error ",
    });
  }
};

exports.unBlockSpacesByFloor = async (req, res) => {
  try {
    const floorObjID = req.body.floorObjID;
    const floorData = await Spaces.aggregate([
      {
        $match: {
          floor_id: new mongoose.Types.ObjectId(floorObjID),
        },
      },
    ]);

    if (floorData.length > 0) {
      var promiseUntilExecutes = new Promise((resolve, reject) => {
        floorData.forEach(async (element, i) => {
          setTimeout(function () {
            let message = Buffer.from("L");
            server.send(message, 20107, element.space_ip, (err) => {
              // client.close();
              console.log("client: ");
            });
            if (i === floorData.length - 1) resolve();
          }, 200 * i); // delay 200 milliSeconds
        });
      });
      promiseUntilExecutes.then(() => {
        return res.status(200).json({
          status: 200,
          message: "Successfully unblocked floor",
        });
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "No floor available",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Unexpected server error ",
    });
  }
};

exports.unBlockSpacesByParking = async (req, res) => {
  try {
    const parkingObjID = req.body.parkingObjID;
    const parkData = await Spaces.aggregate([
      {
        $match: {
          parking_id: new mongoose.Types.ObjectId(parkingObjID),
        },
      },
    ]);

    if (parkData.length > 0) {
      var promiseUntilExecutes = new Promise((resolve, reject) => {
        parkData.forEach(async (element, i) => {
          setTimeout(function () {
            let message = Buffer.from("L");
            server.send(message, 20107, element.space_ip, (err) => {
              // client.close();
            });
            if (i === parkData.length - 1) resolve();
          }, 200 * i); // delay 200 milliSeconds
        });
      });
      promiseUntilExecutes.then(() => {
        return res.status(200).json({
          status: 200,
          message: "Successfully unblocked parking",
        });
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "No parking available",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: 500,
      message: "Unexpected server error ",
    });
  }
};

exports.blockZoneinOrder = async (req, res) => {
  try {
    const zoneObjID = req.body.zoneObjID;
    const zoneData = await Zones.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(zoneObjID),
        },
      },
      {
        $lookup: {
          from: "spaces",
          localField: "slot_names.device_id",
          foreignField: "space_id",
          as: "space",
        },
      },
      {
        $unwind: {
          path: "$space",
        },
      },
      {
        $project: {
          space: 1,
        },
      },
      {
        $addFields: {
          space_id: "$space.space_id",
          space_name: "$space.space_name",
          space_ip: "$space.space_ip",
        },
      },
      {
        $addFields: {
          spaceNumber: {
            $toInt: {
              $last: {
                $split: ["$space_name", "-"],
              },
            },
          },
        },
      },
      {
        $sort: {
          spaceNumber: 1,
        },
      },
      {
        $project: {
          space: 0,
        },
      },
    ]);

    //  spaceData = zoneData[0].space

    if (zoneData.length > 0) {
      var promiseUntilExecutes = new Promise((resolve, reject) => {
        zoneData.forEach((element, i) => {
          setTimeout(
            function () {
              //   let message = Buffer.from(""+i+"-");
              let message = Buffer.from("R");

              // console.log(element.space_ip);
              server.send(message, 20107, element.space_ip, (err, bytes) => {
                //   if(err){
                //     console.log("error")
                //   }else{
                //     console.log("bytes"+ bytes)
                //   }
              });

              if (i === zoneData.length - 1) resolve();
            },
            2500 * i, // delay 200 milliSeconds
          );
        });
      });
      promiseUntilExecutes.then(() => {
        return res.status(200).json({
          status: 200,
          message: "Successfully blocked zone",
        });
      });
    } else {
      return res.status(201).json({
        status: 201,
        message: "No Spaces available",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({
      status: 500,
      message: "error",
      error,
    });
  }
};
