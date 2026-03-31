const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

//Post Admin Register
exports.postAdminRegister = async (req, res, next) => {


  console.log("register");  
  const username = req.body.username;
  const password = req.body.password;
  const role = req.body.role || "user"; // Default to user if not provided

  // validate the request
  const validation = await validateUserInput(username, password);
  if (validation) {
    return res.status(400).json({
      status: 400,
      message: "usename and password should not be empty",
    });
  }

  // Check if user already exists
  const existingUser = await Admin.findOne({ username: username });
  if (existingUser) {
    return res.status(400).json({
      status: 400,
      message: "User already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const createAdmin = await Admin.create({
    username: username,
    password: hashedPassword,
    role: role,
  });

  if (createAdmin) {
    return res.status(200).json({
      status: 200,
      message: "User created successfully!!!",
    });
  } else {
    return res.status(500).json({
      status: 500,
      message: "Something went wrong while creating user",
    });
  }
};

//Post Admin Login
exports.postAdminLogin = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log("login");
  // validate the request
  const validation = await validateUserInput(username, password);
  if (validation) {
    return res.status(400).json({
      status: 400,
      message: "usename and password should not be empty",
    });
  }

  // checking admin exist or not
  const findAdmin = await Admin.findOne({ username: username });
  if (findAdmin) {
    // comparing the password
    const comparePassword = await bcrypt.compare(password, findAdmin.password);
    if (!comparePassword) {
      return res.status(401).json({
        status: 401,
        message: "username/password is incorrect!!!",
      });
    }

    // generate token
    const token = await generateToken(findAdmin._id, findAdmin.role);

    return res.status(200).json({
      status: 200,
      message: "login successfull",
      data: {
        token: token,
        username: username,
        role: findAdmin.role,
        id: findAdmin._id,
      },
    });
  } else {
    return res.status(404).json({
      status: 404,
      message: "user not found",
    });
  }
};

const validateUserInput = async (username, password) => {
  if (
    username == null ||
    password == null ||
    username == "" ||
    password == "" ||
    username == undefined ||
    password == undefined
  ) {
    return true;
  } else {
    return false;
  }
};

const generateToken = async (admin_id, role) => {
  const token = await jwt.sign(
    { id: admin_id, role: role },
    process.env.JWT_SECRET || "SECRET",
    { expiresIn: "2h" }
  );
  return token;
};

const commonResponce = (res, status, message, data) => {
  return res
    .status(status)
    .json({ status: status, message: message, data: data });
};
