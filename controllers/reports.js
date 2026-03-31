const Events = require("../models/SpaceEvents");
const ParkingReports = require("../models/ParkingReports");
const Spaces = require("../models/Spaces");
const Floors = require("../models/Floors");
const Zones = require("../models/Zones");
const Parkings = require("../models/Parkings");

// Helper to parse date string (supports DD/MM/YYYY or DD-MM-YYYY or YYYY-MM-DD from HTML5 inputs)
const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    // Handle YYYY-MM-DD (standard from frontend date inputs)
    if (dateStr.includes("-") && dateStr.split("-")[0].length === 4) {
        const parts = dateStr.split("-");
        return {
            day: parseInt(parts[2]),
            month: parseInt(parts[1]),
            year: parseInt(parts[0])
        };
    }

    const parts = dateStr.includes("/") ? dateStr.split("/") : dateStr.split("-");
    if (parts.length !== 3) return null;

    // Handle DD/MM/YYYY or DD-MM-YYYY
    return {
        day: parseInt(parts[0]),
        month: parseInt(parts[1]),
        year: parseInt(parts[2])
    };
};

// 1. Daily Occupancy Report
exports.getDailyOccupancyReport = async (req, res) => {
    try {
        const dateStr = req.query.date || req.body.date;
        const dateObj = parseDate(dateStr);
        if (!dateObj) return res.status(400).json({ message: "Invalid date format" });

        const report = await ParkingReports.findOne({ 
            day: dateObj.day, 
            month: dateObj.month, 
            year: dateObj.year 
        });
        
        res.status(200).json({ status: 200, data: report ? report.parkingByDay : [] });
    } catch (error) {
        res.status(500).json({ message: "Error fetching occupancy report", error: error.toString() });
    }
};

// 2. Entry/Exit Report
exports.getEntryExitReport = async (req, res) => {
    try {
        const dateStr = req.query.date || req.body.date;
        const dateObj = parseDate(dateStr);
        if (!dateObj) return res.status(400).json({ message: "Invalid date format" });

        const events = await Events.findOne({ 
            day: dateObj.day, 
            month: dateObj.month, 
            year: dateObj.year 
        });

        res.status(200).json({ status: 200, data: events ? events.DetectEvents : [] });
    } catch (error) {
        res.status(500).json({ message: "Error fetching entry/exit report", error: error.toString() });
    }
};

// 3. Stay Duration Report
exports.getStayDurationReport = async (req, res) => {
    try {
        const dateStr = req.query.date || req.body.date;
        const dateObj = parseDate(dateStr);
        if (!dateObj) return res.status(400).json({ message: "Invalid date format" });

        const stayDurationData = await Events.aggregate([
            {
                $match: {
                    day: dateObj.day, // Fix: Use day from dateObj
                    month: dateObj.month,
                    year: dateObj.year
                }
            },
            { $unwind: "$DetectEvents" },
            { $match: { "DetectEvents.duration": { $exists: true, $gt: 5 } } },
            {
                $group: {
                    _id: "$DetectEvents.duration",
                    count: { $sum: 1 }
                }
            },
            { $project: { duration: "$_id", count: 1, _id: 0 } },
            { $sort: { duration: 1 } }
        ]);

        res.status(200).json({ status: 200, data: stayDurationData });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stay duration report", error: error.toString() });
    }
};

// 4. Peak Hours Report
exports.getPeakHoursReport = async (req, res) => {
    try {
        const dateStr = req.query.date || req.body.date;
        const dateObj = parseDate(dateStr);
        if (!dateObj) return res.status(400).json({ message: "Invalid date format" });

        const events = await Events.findOne({ 
            day: dateObj.day, 
            month: dateObj.month, 
            year: dateObj.year 
        });

        if (!events) return res.status(200).json({ status: 200, data: [] });

        const hourlyStats = {};
        events.DetectEvents.forEach(event => {
            if (event.startTime) {
                // Try to extract hour from "HH:mm" or full ISO string
                const timeMatch = event.startTime.match(/(\d{2}):\d{2}/);
                const hour = timeMatch ? timeMatch[1] : new Date(event.startTime).getHours().toString().padStart(2, '0');
                hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
            }
        });

        const data = Object.keys(hourlyStats).map(hour => ({
            hour: `${hour}:00`,
            count: hourlyStats[hour]
        })).sort((a,b) => a.hour.localeCompare(b.hour));

        res.status(200).json({ status: 200, data });
    } catch (error) {
        res.status(500).json({ message: "Error fetching peak hours report", error: error.toString() });
    }
};

// 5. Floor-wise Occupancy
exports.getFloorOccupancyReport = async (req, res) => {
    try {
        const floors = await Floors.find();
        res.status(200).json({ status: 200, data: floors });
    } catch (error) {
        res.status(500).json({ message: "Error fetching floor occupancy", error: error.toString() });
    }
};

// 6. Zone-wise Occupancy
exports.getZoneOccupancyReport = async (req, res) => {
    try {
        const zones = await Zones.find();
        res.status(200).json({ status: 200, data: zones });
    } catch (error) {
        res.status(500).json({ message: "Error fetching zone occupancy", error: error.toString() });
    }
};

// 7. Space Status Report
exports.getSpaceStatusReport = async (req, res) => {
    try {
        const spaces = await Spaces.find().select("space_name device_occupied configure device_mode signal_strength");
        res.status(200).json({ status: 200, data: spaces });
    } catch (error) {
        res.status(500).json({ message: "Error fetching space status", error: error.toString() });
    }
};

// 8. Device Health Report
exports.getDeviceHealthReport = async (req, res) => {
    try {
        const spaces = await Spaces.find();
        const healthData = spaces.map(s => ({
            id: s.space_id,
            name: s.space_name,
            ip: s.space_ip,
            signal: s.signal_strength,
            status: s.configure ? "Online" : "Offline",
            mode: s.device_mode
        }));
        res.status(200).json({ status: 200, data: healthData });
    } catch (error) {
        res.status(500).json({ message: "Error fetching device health", error: error.toString() });
    }
};

// 9. Monthly Summary
exports.getMonthlySummaryReport = async (req, res) => {
    try {
        const month = req.query.month || req.body.month;
        const year = req.query.year || req.body.year;
        
        if (!month || !year) return res.status(400).json({ message: "Month and year are required" });

        const reports = await ParkingReports.find({ month: parseInt(month), year: parseInt(year) });
        res.status(200).json({ status: 200, data: reports });
    } catch (error) {
        res.status(500).json({ message: "Error fetching monthly summary", error: error.toString() });
    }
};

// 10. Date Range Report
exports.getDateRangeReport = async (req, res) => {
    try {
        const fromDateStr = req.query.from || req.body.from_date;
        const toDateStr = req.query.to || req.body.to_date;

        if (!fromDateStr || !toDateStr) return res.status(400).json({ message: "Start and end dates are required" });

        const start = parseDate(fromDateStr);
        const end = parseDate(toDateStr);

        if (!start || !end) return res.status(400).json({ message: "Invalid date range format" });

        const reports = await ParkingReports.find({
            $and: [
                { year: { $gte: start.year, $lte: end.year } },
                { month: { $gte: start.month, $lte: end.month } },
                { day: { $gte: start.day, $lte: end.day } }
            ]
        });

        res.status(200).json({ status: 200, data: reports });
    } catch (error) {
        res.status(500).json({ message: "Error fetching date range report", error: error.toString() });
    }
};