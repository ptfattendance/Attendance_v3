const db = require("../models");
const Qr = db.qr;
const Attendance = db.attendance;
const User = db.user;

// API to generate qr
exports.generate = async (req, res) => {
    try {
        console.log('called generate qr');

        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const stringLength = Math.floor(Math.random() * 21) + 10;
        let generatedString = '';

        for (let i = 0; i < stringLength; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            generatedString += characters[randomIndex];
        }

        const qrString = `attendance-${generatedString}`;

        const existingQR = await Qr.findOne();
        if (existingQR) {
            existingQR.qrString = qrString;
            await existingQR.save();
        } else {
            const qrDocument = new Qr({ qrString });
            await qrDocument.save();
        }

        res.status(200).json({ qrString });
    } catch (error) {
        console.error('Error generating QR:', error);
        res.status(500).json({ message: 'Failed to generate QR code' });
    }
};


// API to verify qr (marks attendance)
exports.verify = async (req, res) => {
    try {
        console.log('called verify qr');

        const { qrCode, email, lastScan } = req.body;

        const qrString = await Qr.findOne({ qrString: qrCode });

        if (qrString) {
            // Check if the user exists in the user schema
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ message: 'Invalid user' });
            }

            // Check if an attendance entry already exists for the current date and email
            const currentDate = new Date().toLocaleDateString('en-US');
            const attendanceEntry = await Attendance.findOne({ email, 'in.date': currentDate });

            if (attendanceEntry) {
                // If an attendance entry already exists, check the lastScan value
                if (lastScan === 'out' && attendanceEntry.lastScan === 'out') {
                    return res.status(400).json({ message: 'You are already out' });
                } else if (lastScan === 'in' && attendanceEntry.lastScan === 'in') {
                    return res.status(400).json({ message: 'You are already in' });
                } else {
                    // Update the lastScan field based on the current scan
                    attendanceEntry.lastScan = lastScan;

                    if (lastScan === 'out') {
                        attendanceEntry.out = {
                            date: currentDate,
                            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        };
                    }

                    // Check if the current time falls within the specified time ranges
                    // const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });



                    const currentTime = new Date();
                    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                    
                    // Define the time ranges in minutes since midnight
                    const morningStart = 8 * 60 + 40;
                    const morningEnd = 13 * 60;
                    const afternoonStart = 13 * 60;
                    const afternoonEnd = 13 * 60 + 40;
                    
                    if ((currentMinutes >= morningStart && currentMinutes <= morningEnd) ||
                        (currentMinutes >= afternoonStart && currentMinutes <= afternoonEnd)) {
                        attendanceEntry.in.late = true;
                    }

                    // if (
                    //     (currentTime >= '08:40 AM' && currentTime <= '01:00 PM') ||
                    //     (currentTime >= '01:00 PM' && currentTime <= '01:40 PM')
                    // ) {
                    //     attendanceEntry.in.late = true;
                    // }

                    await attendanceEntry.save(); // Save the updated attendance entry
                }
            } else {
                // If it's the first entry for the day, mark the 'in' time and set lastScan as 'in'
                if (lastScan === 'out') {
                    return res.status(400).json({ message: 'Invalid operation. First entry must be "in".' });
                }

                const attendanceEntry = new Attendance({
                    email,
                    in: {
                        date: currentDate,
                        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                        late: false, // Set the 'late' field based on your logic
                    },
                    out: {
                        date: '',
                        time: '',
                    },
                    lastScan: 'in',
                });

                // Check if the current time falls within the specified time ranges
                // const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                // if (
                //     (currentTime >= '08:40 AM' && currentTime <= '01:00 PM') ||
                //     (currentTime >= '01:00 PM' && currentTime <= '01:40 PM')
                // ) {
                //     attendanceEntry.in.late = true;
                // }

                const currentTime = new Date();
const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

// Define the time ranges in minutes since midnight
const morningStart = 8 * 60 + 40;
const morningEnd = 13 * 60;
const afternoonStart = 13 * 60;
const afternoonEnd = 13 * 60 + 40;

if ((currentMinutes >= morningStart && currentMinutes <= morningEnd) ||
    (currentMinutes >= afternoonStart && currentMinutes <= afternoonEnd)) {
    attendanceEntry.in.late = true;
}

                await attendanceEntry.save();
            }

            await Qr.deleteOne({ _id: qrString._id }); // Remove the QR code from the database
            res.status(200).json({ message: 'QR verification successful' });
        } else {
            res.status(400).json({ message: 'QR verification failed' });
        }
    } catch (error) {
        console.error('Error verifying QR:', error);
        res.status(500).json({ message: 'Failed to verify QR code' });
    }
};





// await Qr.deleteOne({ _id: qrString._id });