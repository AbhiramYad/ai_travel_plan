// Import the Mongoose library to define schemas and models
import mongoose from 'mongoose';

// Define the schema for the User model
const UserSchema = new mongoose.Schema(
  {
    // The email address of the user, used for registration and login authentication
    email: {
      // Data type is string
      type: String,
      // Field is mandatory; registration will fail if it's missing
      required: [true, 'Please provide an email address'],
      // Email must be unique in the database; prevents multiple accounts with the same email
      unique: true,
      // Auto-convert to lowercase to ensure email matches are case-insensitive
      lowercase: true,
      // Trim leading and trailing whitespace characters
      trim: true
    },
    // The hashed password of the user
    password: {
      // Data type is string
      type: String,
      // Field is mandatory; registration will fail if password is missing
      required: [true, 'Please provide a password']
    }
  },
  {
    // Automatically manage createdAt and updatedAt fields for each user document
    timestamps: true
  }
);

// Create the Mongoose model named 'User' using the schema definition
const User = mongoose.model('User', UserSchema);

// Export the User model as the default export of this module
export default User;
