const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        // More detailed connection logging
        console.log('MongoDB Atlas Connection Details:');
        console.log(`Host: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        console.log(`State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
        console.log('Connection Successful!');

    } catch (error) {
        console.error('MongoDB Atlas Connection Error:');
        console.error(`Error Type: ${error.name}`);
        console.error(`Error Message: ${error.message}`);
        process.exit(1);
    }
};

// Monitor connection events
mongoose.connection.on('connected', () => {
    console.log('MongoDB Atlas - Connected');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB Atlas - Error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB Atlas - Disconnected');
});

// Handle application termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB Atlas - Connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

module.exports = connectDB;