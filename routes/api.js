const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");
const parkingsController = require("../controllers/parkings");
const floorsController = require("../controllers/floors");
const zonesController = require("../controllers/zones");
const spacesController = require("../controllers/spaces");
const displaysController = require("../controllers/displays");
const reportController = require("../controllers/reports");
const commandController = require("../controllers/command");

const isAuth = require("../middleware/is-auth");
const checkRole = require("../middleware/check-role");

// register admin
router.post("/register", adminController.postAdminRegister);

// login admin
// router.post("/login", adminController.postAdminLogin); // original
router.post("/login", adminController.postAdminLogin);

//post parkings route
router.post(
  "/parkings",
  isAuth,
  checkRole(["admin"]),
  parkingsController.postParkings
);

//get parkings route
router.get("/parkings", parkingsController.getParkings);

//get floors by parking id
router.get("/parkings/:parking_id", parkingsController.getFloors);

//post floors
router.post("/floors", isAuth, floorsController.postFloors);

//get floors by parking id
router.get("/floors/:parking_id", floorsController.getFloors);

//get zones by floor id
router.get("/floors/zones/:floor_id", floorsController.getZones);

//get spaces by floor_id
router.get("/floors/spaces/:parking_id", floorsController.getFloorSpace);

//get zones by parking_id
router.get("/zones/parking/:parking_id", zonesController.getZonesByParking);

//post zones
router.post("/zones", isAuth, zonesController.postZones);

//get zones by floor id
router.get("/zones/:floor_id", zonesController.getZones);

//get zone by zone id
router.get("/zone/:zone_id", zonesController.getZone);

//post space
router.post("/space", isAuth, spacesController.postSpace);

//get spaces
router.get("/spaces", spacesController.getSpaces);

//get zones with spaces by floor_id
router.get("/zones/spaces/:floor_id", zonesController.getZoneSpacesCount);

//post display
router.post("/display", isAuth, displaysController.postDisplay);

//get all displays
router.get("/displays", displaysController.getAllDisplays);

//get all displays in  the  parking
router.get("/displays/:parking_id", displaysController.getDisplays);

//get all floors
router.get("/floors", floorsController.getAllFloors);

//update display
router.put("/displays/:id", isAuth, displaysController.updateDisplay);

//delete display
router.delete("/displays/:id", isAuth, displaysController.deleteDisplay);


router.post("/getStayDurationReport",reportController.getStayDurationReport)

// Report routes
router.get("/reports/daily-occupancy", reportController.getDailyOccupancyReport);
router.get("/reports/entry-exit", reportController.getEntryExitReport);
router.get("/reports/stay-duration", reportController.getStayDurationReport);
router.get("/reports/peak-hours", reportController.getPeakHoursReport);
router.get("/reports/floor-occupancy", reportController.getFloorOccupancyReport);
router.get("/reports/zone-occupancy", reportController.getZoneOccupancyReport);
router.get("/reports/space-status", reportController.getSpaceStatusReport);
router.get("/reports/device-health", reportController.getDeviceHealthReport);
router.get("/reports/monthly-summary", reportController.getMonthlySummaryReport);
router.get("/reports/date-range", reportController.getDateRangeReport);

//getSpacesByZone
router.get("/getSpacesByZone/:zoneObjID",spacesController.getSpacesByZone);

//blockSpaceBySpace
router.post("/blockSpaceBySpace", isAuth, commandController.blockSpaceBySpace);

//locateOnSpaceBySpace
router.post("/locateOnSpaceBySpace", isAuth, commandController.locateOnSpaceBySpace);

//blockSpacesByZone
router.post("/blockSpacesByZone", isAuth, commandController.blockZoneinOrder);

//blockSpacesByFloors
router.post("/blockSpacesByFloor", isAuth, commandController.blockSpacesByFloor);

//blockSpacesByParking
router.post("/blockSpacesByParking", isAuth, commandController.blockSpacesByParking);

//unblockSpaceBySpace
router.post("/unBlockSpaceBySpace", isAuth, commandController.unBlockSpaceBySpace);

//locateOffSpaceBySpace
router.post("/locateOffSpaceBySpace", isAuth, commandController.locateOffSpaceBySpace);

//unblockSpacesByZone
router.post("/unBlockSpacesByZone", isAuth, commandController.unBlockSpacesByZone);

//unblockSpacesByFloors
router.post("/unBlockSpacesByFloor", isAuth, commandController.unBlockSpacesByFloor);

//unblockSpacesByParking
router.post("/unBlockSpacesByParking", isAuth, commandController.unBlockSpacesByParking);

//getSpaceList
router.get("/spaceslist",spacesController.getSpaceslist);
router.get("/updateSpaces",spacesController.updateSpaces);


module.exports = router;
