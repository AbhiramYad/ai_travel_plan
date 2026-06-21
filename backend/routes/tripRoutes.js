import express from 'express';
import {
  getUserTrips,
  generateNewTrip,
  updateTrip,
  deleteTrip,
  regenerateDay
} from '../controllers/tripController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Apply auth protection middleware to all trip endpoints
router.use(protect);

router.get('/', getUserTrips);
router.post('/generate', generateNewTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/regenerate-day', regenerateDay);

export default router;
