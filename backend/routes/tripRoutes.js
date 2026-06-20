import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Trip routes placeholder' });
});

export default router;
