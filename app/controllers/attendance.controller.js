const db = require("../models");
const Attendance = db.attendance;
const User = db.user;

// API to list marked attendances for a single user
exports.listAttendances = async (req, res) => {
    try {
        const { email } = req.params; // Assuming the email is passed as a parameter

         // Check if the user exists in the user schema
         const user = await User.findOne({ email });

         if (!user) {
             return res.status(400).json({ message: 'Invalid user' });
         }


        // Find all attendance entries for the specified user email
        const attendances = await Attendance.find({ email });

        if (attendances.length === 0) {
            return res.status(404).json({ message: 'No attendance entries found for the user' });
        }

        res.status(200).json({ attendances });
    } catch (error) {
        console.error('Error listing attendances:', error);
        res.status(500).json({ message: 'Failed to list attendances' });
    }
};

// API to list marked attendances of all users on a single day
// exports.listAttendancesByDate = async (req, res) => {
//     try {
//         const { date } = req.body; // Assuming the date is passed as a parameter

//         // Find all attendance entries for the specified date
//         const attendances = await Attendance.find({ 'in.date': date });

//         if (attendances.length === 0) {
//             return res.status(404).json({ message: 'No attendance entries found for the date' });
//         }

//         res.status(200).json({ attendances });
//     } catch (error) {
//         console.error('Error listing attendances by date:', error);
//         res.status(500).json({ message: 'Failed to list attendances by date' });
//     }
// };

// If batch is not provided all attendance of the date will be shown
exports.listAttendancesByDate = async (req, res) => {
    try {
        const { date, batch } = req.body;

        // If batch is provided, find the user emails in that batch
        let userEmailsInBatch = [];
        if (batch) {
            const usersInBatch = await User.find({ batch }, { email: 1 });
            
            // Check if there are any users in the specified batch
            if (usersInBatch.length === 0) {
                return res.status(400).json({ message: 'Invalid batch' });
            }

            userEmailsInBatch = usersInBatch.map(user => user.email);
        }

        // Construct the query object to filter by date and batch
        const query = batch
            ? { 'in.date': date, email: { $in: userEmailsInBatch } }
            : { 'in.date': date };

        // Find all attendance entries for the specified date and, if provided, batch
        const attendances = await Attendance.find(query);

        if (attendances.length === 0) {
            return res.status(404).json({ message: 'No attendance entries found for the date and batch' });
        }

        res.status(200).json({ attendances });
    } catch (error) {
        console.error('Error listing attendances by date:', error);
        res.status(500).json({ message: 'Failed to list attendances by date' });
    }
};



// API to list attendance by month and year
exports.listAttendancesByMonth = async (req, res) => {
    try {
        const { month, year } = req.body;

        // Get the first and last days of the specified month
        const firstDayOfMonth = new Date(`${year}-${month}-01`);
        const lastDayOfMonth = new Date(`${year}-${month}-31`);

        // Find all attendance entries for the specified month
        const attendances = await Attendance.find({
            'in.date': {
                $gte: `${month}/01/${year}`,
                $lte: `${month}/31/${year}`,
            },
        });

        if (attendances.length === 0) {
            return res.status(404).json({ message: 'No attendance entries found for the month' });
        }

        // Create an array to store the formatted results
        const formattedAttendances = [];

        // Iterate through each attendance entry and fetch user details
        for (const attendance of attendances) {
            const user = await User.findOne({ email: attendance.email });

            const formattedAttendance = {
                in: attendance.in,
                out: attendance.out,
                _id: attendance._id,
                email: attendance.email,
                name: user ? user.name : '', // Include the name from the User collection
                phone: user ? user.phoneNumber : '', // Include the phone number from the User collection
                lastScan: attendance.lastScan,
                __v: attendance.__v,
            };

            formattedAttendances.push(formattedAttendance);
        }

        res.status(200).json({ attendances: formattedAttendances });
    } catch (error) {
        console.error('Error listing attendances by month:', error);
        res.status(500).json({ message: 'Failed to list attendances by month' });
    }
};



exports.listAttendancesByMonthAndBatch = async (req, res) => {
    try {
        const { month, year, batch } = req.body;

        // Get the first and last days of the specified month
        const firstDayOfMonth = new Date(`${year}-${month}-01`);
        const lastDayOfMonth = new Date(`${year}-${month}-31`);

        // Find all users in the specified batch
        const usersInBatch = await User.find({ batch: batch }, { email: 1 });

        // Extract emails from the users
        const userEmailsInBatch = usersInBatch.map(user => user.email);

        // Construct the query object to filter by date and batch
        const query = {
            'in.date': {
                $gte: `${month}/01/${year}`,
                $lte: `${month}/31/${year}`,
            },
            email: { $in: userEmailsInBatch }, // Filter by emails in the specified batch
        };

        // Find all attendance entries for the specified month and batch
        const attendances = await Attendance.find(query);

        if (attendances.length === 0) {
            return res.status(404).json({ message: 'No attendance entries found for the month and batch' });
        }

        // Create an array to store the formatted results
        const formattedAttendances = [];

        // Iterate through each attendance entry and fetch user details
        for (const attendance of attendances) {
            const user = await User.findOne({ email: attendance.email });

            const formattedAttendance = {
                in: attendance.in,
                out: attendance.out,
                _id: attendance._id,
                email: attendance.email,
                name: user ? user.name : '', // Include the name from the User collection
                phone: user ? user.phoneNumber : '', // Include the phone number from the User collection
                batch: user ? user.batch : '', // Include batch from the user collection
                lastScan: attendance.lastScan,
                __v: attendance.__v,
            };

            formattedAttendances.push(formattedAttendance);
        }

        res.status(200).json({ attendances: formattedAttendances });
    } catch (error) {
        console.error('Error listing attendances by month and batch:', error);
        res.status(500).json({ message: 'Failed to list attendances by month and batch' });
    }
};
