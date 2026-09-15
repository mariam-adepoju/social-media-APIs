const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
        console.info(`MongoDB connected: ${connectionInstance.connection.host}`);

        mongoose.connection.on("error", (err) => {
            console.error(`MongoDB runtime connection error: ${err.message}`);
        });
        return connectionInstance.connection;
    } catch (error) {
        console.error(`Initial MongoDB connection error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB