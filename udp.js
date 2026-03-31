var PORT = 20108;
// var HOST = "192.168.1.3";
var HOST = "192.168.1.28";
// var HOST = "192.168.1.53";

//

var dgram = require("dgram");
var server = dgram.createSocket("udp4");
const fs = require("fs");
const Spaces = require("./models/Spaces");
const Displays = require("./models/Displays");
const Zones = require("./models/Zones");
const Floors = require("./models/Floors");
const Parking = require("./models/Parkings");
const app = require("./app");
// const client = dgram.createSocket("udp4");
var obj = [];

function udp() {
  server.on("listening", function () {
    var address = server.address();
    console.log(
      "UDP Server listening on " + address.address + ":" + address.port,
    );
  });

  server.on("message", async function (message, remote) {
    console.log(message.toString());
    let data = message.toString().split(":");
    let device_type = data[0];

    if (parseInt(device_type) === 0) {
      //sensor data
      let space_id = data[1];
      let space_address = data[2];
      let space_ip = data[3];
      let network = data[4];
      let signal_strength = data[5];
      let device_mode = data[6];
      let device_status = data[7];
      let low_distance = data[8];
      let mid_distance = data[9];
      let high_distance = data[10];

      // res.status(200).send({
      //   message: "Space Updated Successfully",
      //   data: updatedSpace
      // });
      //send udp request to change the number
      const s = await Spaces.updateOne(
        { space_id: space_id },
        {
          $set: {
            device_type: device_type,
            space_address: space_address,
            space_ip: space_ip,
            network: network,
            signal_strength: signal_strength,
            device_mode: device_mode,
            device_occupied: device_status,
            low_distance: low_distance,
            mid_distance: mid_distance,
            high_distance: high_distance,
          },
        },
      );
      console.log(space_id + " Updated");
      //here call http socket

      let space_parking_id = await Spaces.find({ space_id: space_id });
      let parking_id = space_parking_id[0].parking_id;
      let floor_id = space_parking_id[0].floor_id;
      let zone_id = space_parking_id[0].zone_id;

      // Get total spaces in the zone
      let zone_data = await Zones.find({ _id: zone_id });

      let zone_spaces = zone_data[0].total_spaces;

      //Get total spaces in the floor
      let floor_data = await Floors.find({ _id: floor_id });
      let floor_spaces = floor_data[0].total_spaces;

      //Get total spaces in the parking
      let parking_data = await Parking.find({ _id: parking_id });
      let parking_spaces = parking_data[0].total_spaces;

      //Get total occupied in the zone
      let zone_occupied = await Spaces.countDocuments({
        zone_id: zone_id,
        device_occupied: true,
      });

      //calclate the free space in the zone
      let zone_free = parseInt(zone_spaces) - parseInt(zone_occupied);

      // Update zone occupancy
      const updateZoneCount = await Zones.updateOne(
        { _id: zone_id },
        {
          $set: {
            occupied: zone_occupied,
            spaces: zone_spaces,
            free: zone_free,
          },
        },
      );

      //Create zone object
      let zone_obj_array = [];
      let zone_obj = {
        zone_id: zone_id,
        zone_occupied: zone_occupied,
        zone_spaces: zone_spaces,
        zone_free: zone_free,
      };
      zone_obj_array.push(zone_obj);

      // Get total occupied in the floor
      let floor_occupied = await Spaces.countDocuments({
        floor_id: floor_id,
        device_occupied: true,
      });

      //Get free space in the floor
      let floor_free = parseInt(floor_spaces) - parseInt(floor_occupied);

      //Update floor occupancy
      const updateFloorCount = await Floors.updateOne(
        { _id: floor_id },
        {
          $set: {
            occupied: floor_occupied,
            spaces: floor_spaces,
            free: floor_free,
          },
        },
      );

      //Create floor object
      let floor_obj_array = [];
      let floor_obj = {
        floor_id: floor_id,
        floor_spaces: floor_spaces,
        floor_occupied: floor_occupied,
        floor_free: floor_free,
        zone_data: zone_obj,
      };
      floor_obj_array.push(floor_obj);

      let parking_occupied = await Spaces.countDocuments({
        parking_id: parking_id,
        device_occupied: true,
      });

      let parking_free = parseInt(parking_spaces) - parseInt(parking_occupied);

      //Update parking occupancy
      const updateParkingCount = await Parking.updateOne(
        { _id: parking_id },
        {
          $set: {
            total_occupied: parking_occupied,
            total_free: parking_free,
          },
        },
      );

      //Create parking object
      let parking_obj_array = [];
      let parking_obj = {
        parking_id: parking_id,
        parking_spaces: parking_spaces,
        parking_occupied: parking_occupied,
        parking_free: parking_free,
        floor_data: floor_obj,
      };

      parking_obj_array.push(parking_obj);

      //console.log(parking_obj);
      app.io.emit("dashboard", parking_obj);

      // let zone_data1 = await Zones.find({ floor_id: floor_id });

      // let floor_occupied1 = 0;
      // let floor_spaces1 = 0;
      // let floor_free1 = 0;

      // for (let z = 0; z < zone_data1.length; z++) {
      //   floor_occupied1 += parseInt(zone_data1[z].occupied);
      //   floor_spaces1 += parseInt(zone_data1[z].total_spaces);

      // }

      // floor_free1 = floor_spaces1 - floor_occupied1;

      // const updateFloorCount = await Floors.updateOne(
      //   { _id: floor_id },
      //   {
      //     $set: {
      //       occupied: floor_occupied1,
      //       spaces: floor_spaces1,
      //       free: floor_free1

      //     }
      //   }
      // );

      // const parking_zone_data = await Zones.find({ parking_id: parking_id });

      // let parking_occupied = 0;
      // let parking_spaces = 0;
      // let parking_free = 0;

      // for (let z = 0; z < parking_zone_data.length; z++) {
      //   parking_occupied += parseInt(parking_zone_data[z].occupied);
      //   parking_spaces += parseInt(parking_zone_data[z].total_spaces);

      // }

      // parking_free = parking_spaces - parking_occupied;
      // console.log("Parking Occupied:" + parking_occupied);

      // const updateParkingCount = await Parking.updateOne(
      //   { _id: parking_id },
      //   {
      //     $set: {
      //       total_occupied: parking_occupied,
      //       total_spacesspaces: parking_spaces,
      //       total_free: parking_free

      //     }
      //   }
      // );

      //console.log("floor_id:" + floor_id);
      //console.log("zone_id" + zone_id);

      const displays = await Displays.find({ parking_id: parking_id });
      //console.log(displays);

      for (let d = 0; d < displays.length; d++) {
        let display_id = displays[d].display_id;
        let connection_ids = displays[d].display_connections_id;
        let ip_address = displays[d].display_ipaddress;
        let display_type = displays[d].display_type;
        let display_name = displays[d].display_name;

        // console.log("sensor data display:" + ip_address);
        // 1 floor 2 zone
        if (parseInt(display_type) === 1) {
          if (connection_ids.includes(floor_id)) {
            let total_floor_count = 0;
            for (let z = 0; z < connection_ids.length; z++) {
              let connected_floor_id = connection_ids[z];

              //calculate device occupied false by zone id in spaces
              let count = await Spaces.countDocuments({
                floor_id: connected_floor_id,
                device_occupied: false,
              });

              total_floor_count += count;
            }
            const updateDisplayCount = await Displays.updateOne(
              { display_id: display_id },
              {
                $set: {
                  current_value: total_floor_count,
                },
              },
            );

            let message = Buffer.from("" + total_floor_count + "-");
            if (total_floor_count === 0) {
              message = Buffer.from("F");
            }
            // delay(200); //
            // console.log("dealying...");
            server.send(message, 20107, ip_address, (err) => {
              // console.log(message);
              //    console.log("" + display_name + " Total Count : " + total_floor_count);
              // client.close();
            });
            let floor_display_obj = {
              display_id: display_id,
              current_value: total_floor_count,
            };
            //   console.log('emit');
            app.io.emit("display", floor_display_obj);
          }
          //floor code goes here
        } else if (parseInt(display_type) === 2) {
          if (connection_ids.includes(zone_id)) {
            let total_count = 0;
            for (let z = 0; z < connection_ids.length; z++) {
              let connected_zone_id = connection_ids[z];

              //calculate device occupied false by zone id in spaces
              let count = await Spaces.countDocuments({
                zone_id: connected_zone_id,
                device_occupied: false,
              });

              total_count += count;
            }

            const updateDisplayCount = await Displays.updateOne(
              { display_id: display_id },
              {
                $set: {
                  current_value: total_count,
                },
              },
            );

            let message = Buffer.from("" + total_count + "-");
            if (total_count === 0) {
              message = Buffer.from("F");
            }
            // delay(200); //
            // console.log("dealying...");
            server.send(message, 20107, ip_address, (err) => {
              // console.log(message);
              //   console.log("" + display_name + " Total Count : " + total_count);
              // client.close();
            });
            let zone_display_obj = {
              display_id: display_id,
              current_value: total_count,
            };
            // console.log("emit");
            app.io.emit("display", zone_display_obj);
          }
        }
      }
    } else if (parseInt(device_type) === 1) {
      // display data
      // 1:20000001:CC50E32B63:172.16.129.657:Liquidlab1:-60:r
      console.log("Display Connected!!!");
      let display_id = data[1];
      let display_address = data[2];
      let display_ipaddress = data[3];
      let display_network = data[4];
      let display_signal_strength = data[5];
      let display_request = data[6];

      const check_display = await Displays.find({ display_id: display_id });

      // console.log(check_display);
      if (check_display) {
        const updateDisplay = await Displays.updateOne(
          { display_id: display_id },
          {
            $set: {
              display_address: display_address,
              display_ipaddress: display_ipaddress,
              display_network: display_network,
              display_signal_strength: display_signal_strength,
              display_request: display_request,
            },
          },
        );

        //calculate spaces and send data to display

        //1.check display connected to zones or floors 1.floors 2.zones
        const display_data = await Displays.find({ display_id: display_id });
        console.log(display_data);
        let ip_address = display_data[0].display_ipaddress;
        let type = display_data[0].display_type;
        let connection_ids = display_data[0].display_connections_id;

        console.log(ip_address, type, connection_ids);
        if (parseInt(type) === 1) {
          //floor
        } else if (parseInt(type) === 2) {
          // zones
          // console.log("inside zones types");
          let total_count = 0;
          for (let z = 0; z < connection_ids.length; z++) {
            let zone_id = connection_ids[z];

            //calculate device occupied false by zone id in spaces
            let count = await Spaces.countDocuments({
              zone_id: zone_id,
              device_occupied: false,
            });

            total_count += count;
          }

          //update display current value here
          const updateDisplayCount = await Displays.updateOne(
            { display_id: display_id },
            {
              $set: {
                current_value: total_count,
              },
            },
          );

          // console.log("total count : " + total_count);

          let message = Buffer.from("" + total_count + "-");
          if (total_count === 0) {
            message = Buffer.from("F");
          }
          server.send(message, 20107, ip_address, (err) => {
            // console.log(message);
            // client.close();
          });
        }

        // ============================================
        // console.log(display_id + " Display Updated");
      }
    }

    //ZoneSocketController.getZoneStats();
  });

  server.bind(PORT, HOST);
}

module.exports = udp;
