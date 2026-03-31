const Displays = require("../models/Displays");
const Spaces = require("../models/Spaces");

exports.postDisplay = async (req, res, next) => {
  const parking_id = req.body.parking_id;
  const display_name = req.body.display_name;
  const display_id = req.body.display_id;
  const display_type = req.body.display_type;
  const display_connections_id = req.body.display_connections_id;
  const display_connections_name = req.body.display_connections_name;

  //console.log(display_connections_name);

  const isIdAvailable = await Displays.findOne({display_id: display_id});
  console.log('isIdAvailable: ', isIdAvailable);

  if(isIdAvailable)
  {
    return res.status(201).send({ message: "Display with same ID already created" });
  }

  const display = await Displays.create({
    parking_id: parking_id,
    display_name: display_name,
    display_id: display_id,
    display_type: display_type,
    display_connections_id: display_connections_id,
    display_connections_name: display_connections_name
  });

  if (display) {
    //console.log(display_type);


    if (parseInt(display_type) === 1) {

      // if (display_connections_id.includes(floor_id)) {
      let total_floor_count = 0;
      for (let z = 0; z < display_connections_id.length; z++) {

        let connected_floor_id = display_connections_id[z];


        //calculate device occupied false by zone id in spaces
        let count = await Spaces.countDocuments({
          floor_id: connected_floor_id,
          device_occupied: false
        });

        total_floor_count += count;
      }

      const updateDisplayCount = await Displays.updateOne(
        { display_id: display_id },
        {
          $set: {
            current_value: total_floor_count
          }
        }
      );

      // let message = Buffer.from("" + total_floor_count + "-");
      // if (total_floor_count === 0) {
      //   message = Buffer.from("F");
      // }
      // // delay(200); //
      // // console.log("dealying...");
      // server.send(message, 20107, ip_address, err => {
      //   // console.log(message);
      //   console.log("" + display_name + " Total Count : " + total_floor_count);
      //   // client.close();
      // });


      //}
      //floor code goes here
    } else if (parseInt(display_type) === 2) {


      let total_zone_count = 0;
      for (let z = 0; z < display_connections_id.length; z++) {

        let connected_zone_id = display_connections_id[z];


        //calculate device occupied false by zone id in spaces
        let count = await Spaces.countDocuments({
          zone_id: connected_zone_id,
          device_occupied: false
        });
        //console.log(count);
        total_zone_count += count;
      }
      //console.log(total_zone_count);
      const updateDisplayCount = await Displays.updateOne(
        { display_id: display_id },
        {
          $set: {
            current_value: total_zone_count
          }
        }
      );
    }

    // let message = Buffer.from("" + total_count + "-");
    // if (total_count === 0) {
    //   message = Buffer.from("F");
    // }
    // // delay(200); //
    // // console.log("dealying...");
    // server.send(message, 20107, ip_address, err => {
    //   // console.log(message);
    //   console.log("" + display_name + " Total Count : " + total_count);
    //   // client.close();
    // });

    //}





    res
      .status(200)
      .send({ message: "Display Inserted Successfully", data: display });
  } else {
    res.status(403).send({ message: "Something Went Wrong" });
  }
};

exports.getDisplays = async (req, res, next) => {
  const parking_id = req.params.parking_id;
  Displays.find({ parking_id: parking_id })
    .then(displays => {
      res
        .status(200)
        .send({ message: "All Displays By Parking Id", data: displays });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ message: "Error fetching displays" });
    });
};

exports.getAllDisplays = async (req, res, next) => {
  Displays.find()
    .then(displays => {
      res
        .status(200)
        .send({ message: "All Displays", data: displays });
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({ message: "Error fetching displays" });
    });
};

exports.updateDisplay = async (req, res, next) => {
  const id = req.params.id;
  const { display_connections_id, display_connections_name } = req.body;

  try {
    const display = await Displays.findById(id);
    if (!display) {
      return res.status(404).send({ message: "Display not found" });
    }

    display.display_name = req.body.display_name || display.display_name;
    display.display_id = req.body.display_id || display.display_id;
    display.display_ipaddress = req.body.display_ipaddress || display.display_ipaddress;
    display.display_connections_id = display_connections_id || display.display_connections_id;
    display.display_connections_name = display_connections_name || display.display_connections_name;
    
    // Recalculate current_value based on new connections
    let total_count = 0;
    if (parseInt(display.display_type) === 1) { // Floor
      for (const connId of display.display_connections_id) {
        const count = await Spaces.countDocuments({
          floor_id: connId,
          device_occupied: false
        });
        total_count += count;
      }
    } else if (parseInt(display.display_type) === 2) { // Zone
      for (const connId of display.display_connections_id) {
        const count = await Spaces.countDocuments({
          zone_id: connId,
          device_occupied: false
        });
        total_count += count;
      }
    }
    display.current_value = total_count;

    await display.save();
    res.status(200).send({ message: "Display updated successfully", data: display });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Update failed" });
  }
};

exports.deleteDisplay = async (req, res, next) => {
  const id = req.params.id;
  try {
    const result = await Displays.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).send({ message: "Display not found" });
    }
    res.status(200).send({ message: "Display deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Deletion failed" });
  }
};
