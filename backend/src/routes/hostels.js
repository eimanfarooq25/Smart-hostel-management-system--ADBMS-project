const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getAllHostels,
  getHostelById,
  getRoomsByHostel,
  getAvailableBeds
} = require('../controllers/hostelController');
router.get('/', getAllHostels);
router.get('/:hostel_id', getHostelById);
router.get('/:hostel_id/rooms', getRoomsByHostel);

router.get('/rooms/:room_id/beds', authenticateToken, getAvailableBeds);

module.exports = router;