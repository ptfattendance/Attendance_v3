const db = require("../models");
const Attendance = db.attendance;
const User = db.user;
const Image = db.image;
const moment = require('moment');

// API to list attendances for a user in descending order
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

        // Format the date in the desired format and sort the attendances
        const formattedAttendances = attendances
            .map(attendance => ({
                ...attendance.toObject(),
                in: {
                    ...attendance.in,
                    date: new Date(attendance.in.date).toLocaleDateString('en-US'),
                },
                out: {
                    ...attendance.out,
                    date: attendance.out.date ? new Date(attendance.out.date).toLocaleDateString('en-US') : '',
                },
            }))
            .sort((a, b) => new Date(b.in.date) - new Date(a.in.date));

        res.status(200).json({ attendances: formattedAttendances });
    } catch (error) {
        console.error('Error listing attendances:', error);
        res.status(500).json({ message: 'Failed to list attendances' });
    }
};

// API to list attendances by date and, if provided, batch
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

        // Retrieve user names and images based on email
        const populatedAttendances = await Promise.all(
            attendances.map(async (attendance) => {
                const user = await User.findOne({ email: attendance.email }, { name: 1 });
                const image = await Image.findOne({ email: attendance.email }, { data: 1 });

                return {
                    attendance: {
                        ...attendance.toObject(),
                        in: {
                            ...attendance.in,
                            date: new Date(attendance.in.date).toLocaleDateString('en-US'),
                        },
                        out: {
                            date: attendance.out.date ? new Date(attendance.out.date).toLocaleDateString('en-US') : '',
                            time: attendance.out.time || '',
                        },
                    },
                    name: user ? user.name : '',
                    image: image ? image.data : '',
                };
            })
        );

        res.status(200).json({ attendances: populatedAttendances });
    } catch (error) {
        console.error('Error listing attendances by date:', error);
        res.status(500).json({ message: 'Failed to list attendances by date' });
    }
};




// // API to list attendance by month and year
// exports.listAttendancesByMonth = async (req, res) => {
//     try {
//         let filter = {};

//         const { month, year } = req.body;

//         if (year) {
//             // If year is provided, filter by year
//             filter['in.date'] = {
//                 $gte: new Date(`${year}-01-01`),
//                 $lte: new Date(`${year}-12-31`),
//             };

//             if (month) {
//                 // If month is also provided, update the filter to include the specific month
//                 filter['in.date'] = {
//                     $gte: new Date(`${year}-${month}-01`),
//                     $lte: new Date(`${year}-${month}-31`),
//                 };
//             }
//         }

//         // Find all attendance entries based on the filter
//         const attendances = await Attendance.find(filter);

//         if (attendances.length === 0) {
//             return res.status(404).json({ message: 'No attendance entries found for the specified period' });
//         }

//         // Convert the date strings to formatted strings for proper output
//         const formattedAttendances = attendances.map(attendance => {
//             const formattedDate = moment(attendance.in.date).format('M/D/YYYY');

//             const formattedAttendance = {
//                 in: {
//                     date: formattedDate,
//                     time: attendance.in.time,
//                     late: attendance.in.late,
//                 },
//                 out: {
//                     date: attendance.out.date ? moment(attendance.out.date).format('M/D/YYYY') : null,
//                     time: attendance.out.time,
//                 },
//                 _id: attendance._id,
//                 email: attendance.email,
//                 lastScan: attendance.lastScan,
//                 __v: attendance.__v,
//             };

//             return formattedAttendance;
//         });

//         res.status(200).json({ attendances: formattedAttendances });
//     } catch (error) {
//         console.error('Error listing attendances:', error);
//         res.status(500).json({ message: 'Failed to list attendances' });
//     }
// };


// API to list attendance by month, year, and batch
exports.listAttendancesByMonthAndBatch = async (req, res) => {
    try {
        const { month, year, batch } = req.body;

        // If no parameters are provided, retrieve all attendance entries with user details
        if (!month && !year && !batch) {
            const allAttendances = await Attendance.find();

            const formattedAllAttendances = await Promise.all(
                allAttendances.map(async (attendance) => {
                    const user = await User.findOne({ email: attendance.email });

                    // Fetch user image from the image collection
                    const image = await Image.findOne({ email: attendance.email }, { data: 1 });

                    return {
                        in: {
                            ...attendance.in,
                            date: new Date(attendance.in.date).toLocaleDateString('en-US'),
                        },
                        out: {
                            date: attendance.out.date ? new Date(attendance.out.date).toLocaleDateString('en-US') : '',
                            time: attendance.out.time || '',
                        },
                        _id: attendance._id,
                        email: attendance.email,
                        name: user ? user.name : '',
                        phone: user ? user.phoneNumber : '',
                        address: user ? user.address : '',
                        designation: user ? user.designation : '',
                        batch: user ? user.batch : '',
                        lastScan: attendance.lastScan,
                        image: image ? image.data : '', // Include user image
                        createdAt: user ? new Date(user.createdAt).toISOString() : '',
                        updatedAt: user ? new Date(user.updatedAt).toISOString() : '',
                        __v: attendance.__v,
                    };
                })
            );

            return res.status(200).json({ attendances: formattedAllAttendances });
        }

        // Construct the base query to filter by date
        const baseQuery = {
            'in.date': {},
        };

        // Update the query based on the parameters provided
        if (month && year) {
            baseQuery['in.date'].$gte = `${month}/01/${year}`;
            baseQuery['in.date'].$lte = `${month}/31/${year}`;
        } else if (year) {
            baseQuery['in.date'].$gte = `01/01/${year}`;
            baseQuery['in.date'].$lte = `12/31/${year}`;
        }

        // If batch is provided, find the user emails in that batch
        let userEmailsInBatch = [];
        let batchQuery = {};

        if (batch) {
            const usersInBatch = await User.find({ batch }, { email: 1 });

            // Check if there are any users in the specified batch
            if (usersInBatch.length === 0) {
                return res.status(400).json({ message: 'Invalid batch' });
            }

            userEmailsInBatch = usersInBatch.map(user => user.email);
            // Define batchQuery for batch-only condition
            batchQuery = { email: { $in: userEmailsInBatch } }

        }

        // Update the query to include batch filtering
        if (batch && month && year) {
            // Filter by date and batch
            baseQuery.email = { $in: userEmailsInBatch };
        } else if (batch) {
            // Filter only by batch without date filtering
            const attendancesBatchOnly = await Attendance.find(batchQuery);

            const formattedAttendancesBatchOnly = await Promise.all(
                attendancesBatchOnly.map(async (attendance) => {
                    // Fetch user and image from the image collection
                    const user = await User.findOne({ email: attendance.email });
                    const image = await Image.findOne({ email: attendance.email }, { data: 1 });

                    return {
                        in: {
                            ...attendance.in,
                            date: new Date(attendance.in.date).toLocaleDateString('en-US'),
                        },
                        out: {
                            date: attendance.out.date ? new Date(attendance.out.date).toLocaleDateString('en-US') : '',
                            time: attendance.out.time || '',
                        },
                        _id: attendance._id,
                        email: attendance.email,
                        name: user ? user.name : '',
                        phone: user ? user.phoneNumber : '',
                        address: user ? user.address : '',
                        designation: user ? user.designation : '',
                        batch: user ? user.batch : '',
                        lastScan: attendance.lastScan,
                        image: image ? image.data : '', // Include user image
                        createdAt: user ? new Date(user.createdAt).toISOString() : '',
                        updatedAt: user ? new Date(user.updatedAt).toISOString() : '',
                        __v: attendance.__v, // Include user image
                    };
                })
            );

            return res.status(200).json({ attendances: formattedAttendancesBatchOnly });

        }

        // Find all attendance entries based on the constructed query
        const attendances = await Attendance.find(baseQuery);

        if (attendances.length === 0) {
            return res.status(404).json({ message: 'No attendance entries found for the specified parameters' });
        }

        // Convert the date strings to Date objects for proper sorting
        const sortedAttendances = attendances.sort((a, b) => new Date(b.in.date) - new Date(a.in.date));

        // Create an array to store the formatted results
        const formattedAttendances = await Promise.all(
            sortedAttendances.map(async (attendance) => {
                const user = await User.findOne({ email: attendance.email });

                // Fetch user image from the image collection
                const image = await Image.findOne({ email: attendance.email }, { data: 1 });

                return {
                    in: {
                        ...attendance.in,
                        date: new Date(attendance.in.date).toLocaleDateString('en-US'),
                    },
                    out: {
                        date: attendance.out.date ? new Date(attendance.out.date).toLocaleDateString('en-US') : '',
                        time: attendance.out.time || '',
                    },
                    _id: attendance._id,
                    email: attendance.email,
                    name: user ? user.name : '',
                    phone: user ? user.phoneNumber : '',
                    address: user ? user.address : '',
                    designation: user ? user.designation : '',
                    batch: user ? user.batch : '',
                    lastScan: attendance.lastScan,
                    image: image ? image.data : '', // Include user image
                    createdAt: user ? new Date(user.createdAt).toISOString() : '',
                    updatedAt: user ? new Date(user.updatedAt).toISOString() : '',
                    __v: attendance.__v,
                };
            })
        );

        res.status(200).json({ attendances: formattedAttendances });
    } catch (error) {
        console.error('Error listing attendances by month and batch:', error);
        res.status(500).json({ message: 'Failed to list attendances by month and batch' });
    }
};





// API to get the latest attendance status for a user on today
exports.getLatestAttendanceStatus = async (req, res) => {
    try {
        const { email } = req.params; // Assuming the email is passed as a parameter

        const currentDate = new Date().toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
        // Get the current date in the format "12/23/2023"
        // const currentDate = new Date().toLocaleDateString('en-US', {
        //     month: '2-digit',
        //     day: '2-digit',
        //     year: 'numeric',
        // });
        console.log(currentDate); //01/04/2024
        // //1/4/2024
        // const dat = new Date().toLocaleDateString('en-US');
        // console.log(dat);

        // Find the latest attendance entry for the specified user and today's date
        const latestAttendanceEntry = await Attendance.findOne({
            email,
            'in.date': currentDate,
        }).sort({ 'in.time': -1 }); // Sort in descending order to get the latest entry

        if (!latestAttendanceEntry) {
            return res.status(200).json({ status: 'not scanned' });
        }

        res.status(200).json({ status: latestAttendanceEntry.lastScan });
    } catch (error) {
        console.error('Error getting latest attendance status:', error);
        res.status(500).json({ message: 'Failed to get latest attendance status' });
    }
};
