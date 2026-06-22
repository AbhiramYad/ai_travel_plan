// Import the Mongoose library to define schemas and models
import mongoose from 'mongoose';

// Define the detailed activity schema used within the daily itinerary array
const ActivitySchema = new mongoose.Schema({
  // The title of the specific activity (e.g. "Visit Eiffel Tower")
  title: {
    type: String,
    required: [true, 'Activity title is required']
  },
  // The description details of what the activity entails
  description: {
    type: String
  },
  // The estimated cost in USD for this activity
  estimatedCostUSD: {
    type: Number,
    default: 0
  },
  // The time of the day the activity takes place
  timeOfDay: {
    type: String,
    default: 'Morning'
  }
});

// Define the itinerary schema representing a single day in the travel plan
const DailyItinerarySchema = new mongoose.Schema({
  // The number of the day in the trip sequence (e.g. 1, 2, 3...)
  dayNumber: {
    type: Number,
    required: [true, 'Day number is required']
  },
  // Array of activities planned for this specific day
  activities: [ActivitySchema]
});

// Define the schema for hotel recommendations for the trip
const HotelSchema = new mongoose.Schema({
  // The name of the recommended hotel
  name: {
    type: String,
    required: [true, 'Hotel name is required']
  },
  // The tier or standard of the hotel (e.g. budget, premium, luxury)
  tier: {
    type: String
  },
  // The estimated cost per night in USD
  estimatedCostNightUSD: {
    type: Number
  },
  // The user rating or star rating of the hotel (e.g. "4.5 stars")
  rating: {
    type: String
  }
});

// Define the schema for tracking estimated expenses in different categories
const EstimatedBudgetSchema = new mongoose.Schema({
  // Cost estimated for transportation (flights, local transport)
  transport: {
    type: Number,
    default: 0
  },
  // Cost estimated for accommodation (hotels, stays)
  accommodation: {
    type: Number,
    default: 0
  },
  // Cost estimated for dining/food
  food: {
    type: Number,
    default: 0
  },
  // Cost estimated for planned activities
  activities: {
    type: Number,
    default: 0
  },
  // Total summed budget calculated across all categories
  total: {
    type: Number,
    default: 0
  }
});

// Define the schema for a single packing list item
const PackingItemSchema = new mongoose.Schema({
  // The name/description of the item to pack
  item: {
    type: String,
    required: [true, 'Packing item name is required']
  },
  // Category of the item to pack
  category: {
    type: String,
    default: 'Other'
  },
  // Checked status indicating if the item has been packed by the user
  isPacked: {
    type: Boolean,
    default: false
  }
});

// Define the core Mongoose schema for the Trip model
const TripSchema = new mongoose.Schema(
  {
    // The reference ID to the User model, showing which user owns this trip
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // The destination of the travel plan (e.g., "Paris, France")
    destination: {
      type: String,
      required: [true, 'Destination is required']
    },
    // The total duration of the trip in days
    durationDays: {
      type: Number,
      required: [true, 'Duration in days is required']
    },
    // Budget level indicator
    budgetTier: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: [true, 'Budget tier is required']
    },
    // User interest tags for customize itinerary matching (e.g. ['hiking', 'museums'])
    interests: [
      {
        type: String
      }
    ],
    // The day-by-day travel plan generated for the user
    itinerary: [DailyItinerarySchema],
    // List of recommended hotel options for the trip
    hotels: [HotelSchema],
    // Budget breakdown calculations
    estimatedBudget: {
      type: EstimatedBudgetSchema,
      default: () => ({})
    },
    // Complete checklist of items to pack, categorized and toggleable
    packingList: [PackingItemSchema]
  },
  {
    // Automatically add and manage createdAt and updatedAt fields for auditing
    timestamps: true
  }
);

// Create the Mongoose model named 'Trip' using the schema definition
const Trip = mongoose.model('Trip', TripSchema);

// Export the Trip model as the default export of this module
export default Trip;
