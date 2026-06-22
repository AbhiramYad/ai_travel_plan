import Trip from '../models/Trip.js';

// Normalize timeOfDay values Gemini may return into consistent labels
function normalizeTimeOfDay(value) {
  if (!value) return 'Morning';
  const v = value.toLowerCase().replace(/[-\s]/g, '');
  if (v.includes('morning')) return 'Morning';
  if (v.includes('midday') || v.includes('noon') || v.includes('lunch')) return 'Midday';
  if (v.includes('afternoon')) return 'Afternoon';
  if (v.includes('evening') || v.includes('sunset')) return 'Evening';
  if (v.includes('night') || v.includes('dinner')) return 'Night';
  return value; // passthrough if unrecognized
}

// Normalize packing list category values Gemini may return
function normalizeCategory(value) {
  if (!value) return 'Other';
  const v = value.toLowerCase();
  if (v.includes('document') || v.includes('passport') || v.includes('visa')) return 'Documents';
  if (v.includes('cloth') || v.includes('shirt') || v.includes('pant') || v.includes('dress')) return 'Clothing';
  if (v.includes('outer') || v.includes('jacket') || v.includes('coat')) return 'Outerwear';
  if (v.includes('shoe') || v.includes('foot') || v.includes('boot') || v.includes('sandal')) return 'Footwear';
  if (v.includes('accessor') || v.includes('jewel') || v.includes('watch')) return 'Accessories';
  if (v.includes('bag') || v.includes('luggage') || v.includes('backpack')) return 'Bags';
  if (v.includes('electron') || v.includes('charger') || v.includes('camera') || v.includes('device')) return 'Electronics';
  if (v.includes('gear') || v.includes('equipment') || v.includes('sport')) return 'Gear';
  if (v.includes('toilet') || v.includes('hygiene') || v.includes('grooming') || v.includes('health')) return 'Toiletries';
  if (v.includes('medic') || v.includes('pill') || v.includes('drug') || v.includes('pharmacy')) return 'Medication';
  if (v.includes('weather') || v.includes('rain') || v.includes('umbrella') || v.includes('sunscreen')) return 'Weather Gear';
  if (v.includes('essential') || v.includes('travel') || v.includes('misc')) return 'Travel Essentials';
  return 'Other';
}

async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw new Error(`API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const generateNewTrip = async (req, res) => {
  try {
    const { destination, durationDays, budgetTier, interests } = req.body;
    const userId = req.user.id;

    if (!destination || !durationDays || !budgetTier) {
      return res.status(400).json({ message: 'Destination, durationDays, and budgetTier are required' });
    }

    const prompt = `Create a detailed travel plan for a ${durationDays}-day trip to ${destination}.
Budget: ${budgetTier}. Interests: ${interests ? (Array.isArray(interests) ? interests.join(', ') : interests) : 'general sightseeing'}.
Return ONLY a valid JSON object with this exact structure:
{
  "itinerary": [{ "dayNumber": 1, "activities": [{ "title": "Activity name", "description": "Activity details", "estimatedCostUSD": 20, "timeOfDay": "Morning" }] }],
  "hotels": [{ "name": "Hotel Name", "tier": "Low/Medium/High", "estimatedCostNightUSD": 100, "rating": "4.5 stars" }],
  "estimatedBudget": { "transport": 50, "accommodation": 200, "food": 100, "activities": 150, "total": 500 },
  "packingList": [{ "item": "Packing Item", "category": "Clothing", "isPacked": false }]
}
Estimates must match realistic local rates for the budgetTier.
packingList must be weather-aware and activity-specific for the destination and season.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    };

    const responseData = await fetchWithRetry(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const contentText = responseData.candidates[0].content.parts[0].text;
    const tripData = JSON.parse(contentText);

    // Normalize Gemini's unpredictable timeOfDay and category values before saving
    const normalizedItinerary = (tripData.itinerary || []).map(day => ({
      ...day,
      activities: (day.activities || []).map(act => ({
        ...act,
        timeOfDay: normalizeTimeOfDay(act.timeOfDay)
      }))
    }));

    const normalizedPackingList = (tripData.packingList || []).map(item => ({
      ...item,
      category: normalizeCategory(item.category)
    }));

    const newTrip = new Trip({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests: Array.isArray(interests) ? interests : (interests ? interests.split(',').map(i => i.trim()) : []),
      itinerary: normalizedItinerary,
      hotels: tripData.hotels,
      estimatedBudget: tripData.estimatedBudget,
      packingList: normalizedPackingList
    });

    const savedTrip = await newTrip.save();
    return res.status(201).json(savedTrip);
  } catch (error) {
    console.error('Error in generateNewTrip:', error);
    return res.status(500).json({ message: 'Server error during trip generation', error: error.message });
  }
};

export const getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id });
    return res.status(200).json(trips);
  } catch (error) {
    return res.status(500).json({ message: 'Server error fetching user trips', error: error.message });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    if (req.body.itinerary !== undefined) trip.itinerary = req.body.itinerary;
    if (req.body.packingList !== undefined) trip.packingList = req.body.packingList;
    if (req.body.destination !== undefined) trip.destination = req.body.destination;
    if (req.body.durationDays !== undefined) trip.durationDays = req.body.durationDays;
    if (req.body.budgetTier !== undefined) trip.budgetTier = req.body.budgetTier;
    if (req.body.interests !== undefined) trip.interests = req.body.interests;
    if (req.body.hotels !== undefined) trip.hotels = req.body.hotels;
    if (req.body.estimatedBudget !== undefined) trip.estimatedBudget = req.body.estimatedBudget;

    const updatedTrip = await trip.save();
    return res.status(200).json(updatedTrip);
  } catch (error) {
    return res.status(500).json({ message: 'Server error updating trip', error: error.message });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    await trip.deleteOne();
    return res.status(200).json({ message: 'Trip deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error deleting trip', error: error.message });
  }
};

export const regenerateDay = async (req, res) => {
  try {
    const { dayNumber, feedback } = req.body;
    if (!dayNumber || !feedback) {
      return res.status(400).json({ message: 'dayNumber and feedback are required' });
    }

    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found or unauthorized' });
    }

    const dayIndex = trip.itinerary.findIndex(day => day.dayNumber === Number(dayNumber));
    if (dayIndex === -1) {
      return res.status(400).json({ message: 'Specified dayNumber does not exist in itinerary' });
    }

    const prompt = `You are updating Day ${dayNumber} of a travel itinerary to ${trip.destination}.
User wants this change: "${feedback}".
Existing activities for Day ${dayNumber}:
${JSON.stringify(trip.itinerary[dayIndex].activities)}
Return ONLY a valid JSON array of updated activities for this day. Follow this exact structure:
[{ "title": "Activity name", "description": "Activity details", "estimatedCostUSD": 20, "timeOfDay": "Morning" }]`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    };

    const responseData = await fetchWithRetry(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const contentText = responseData.candidates[0].content.parts[0].text;
    const newActivities = JSON.parse(contentText);

    trip.itinerary[dayIndex].activities = newActivities;
    const updatedTrip = await trip.save();

    return res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Error in regenerateDay:', error);
    return res.status(500).json({ message: 'Server error regenerating day itinerary', error: error.message });
  }
};

