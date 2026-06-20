// Import the Mongoose library to interact with MongoDB
import mongoose from 'mongoose';

/**
 * Asynchronously connects to the MongoDB database using the connection string from environment variables.
 * Under Node.js --env-file option, process.env will automatically contain the MONGO_URI.
 */
const connectDB = async () => {
  try {
    // Attempt to establish a connection to the MongoDB database
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    // Log a success message containing the connection host to confirm connectivity
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Log any errors that occur during the connection attempt
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // Exit the process with failure code (1) to prevent the server from running without a database connection
    process.exit(1);
  }
};

// Export the connectDB function as the default export of this module
export default connectDB;
