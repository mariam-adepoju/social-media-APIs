require('dotenv').config();
const app = require('./app')
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000
const startServer = async () => {
    try {
        await connectDB();
        const server = app.listen(PORT, () => {
            console.info(`Server is running on port: ${PORT}`);

        })
        server.on("error", (error) => {
            console.error("Server error", error);
            process.exit(1);
        });
    } catch (error) {
        console.error("Application startup failed", error);
        process.exit(1);
    }
}
startServer()