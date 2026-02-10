const cron = require('node-cron');
const Transaction = require('../models/Transaction');
const Fine = require('../models/Fine');
const User = require('../models/User');

const checkOverdueBooks = async () => {
    console.log('Running Cron Job: Checking Overdue Books & Calculating Fines...');
    try {
        const today = new Date();
        const gracePeriodDays = 2;
        const finePerDay = 5;

        // Find all issued transactions
        const activeTransactions = await Transaction.find({ status: 'Issued' });

        for (const txn of activeTransactions) {
            const dueDate = new Date(txn.dueDate);

            // Check if overdue
            if (today > dueDate) {
                // Calculate overdue days
                const diffTime = Math.abs(today - dueDate);
                const overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Update Transaction Status
                if (txn.status !== 'Overdue') {
                    txn.status = 'Overdue';
                    await txn.save();
                    console.log(`Transaction ${txn._id} marked as Overdue.`);
                }

                // Fine Calculation
                let chargeableDays = overdueDays - gracePeriodDays;
                if (chargeableDays < 0) chargeableDays = 0;

                const fineAmount = chargeableDays * finePerDay;

                if (fineAmount > 0) {
                    // Update Transaction Fine Amount
                    txn.fineAmount = fineAmount;
                    await txn.save();

                    // Update or Create Fine Record
                    let fine = await Fine.findOne({ transaction: txn._id });

                    if (!fine) {
                        fine = new Fine({
                            user: txn.user,
                            transaction: txn._id,
                            overdueDays: overdueDays,
                            finePerDay: finePerDay,
                            totalFine: fineAmount,
                            status: 'Pending'
                        });
                    } else {
                        fine.overdueDays = overdueDays;
                        fine.totalFine = fineAmount;
                    }
                    await fine.save();
                    console.log(`Fine updated for User ${txn.user}: ₹${fineAmount}`);
                }
            }
        }
        console.log('Cron Job Completed.');
    } catch (error) {
        console.error('Error in Cron Job:', error);
    }
};

// Schedule tasks to be run on the server.
const initCronJobs = () => {
    // Run every day at midnight: '0 0 * * *'
    // For testing/demo purposes, we can run it every minute: '* * * * *' (if requested)
    // Sticking to requirement: Daily Job (12 AM)
    cron.schedule('0 0 * * *', checkOverdueBooks);
    console.log('Cron Jobs Initialized: Overdue Check scheduled for 00:00 daily.');
};

module.exports = { initCronJobs, checkOverdueBooks };
