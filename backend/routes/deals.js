const express = require('express');
const router = express.Router();
const { getDeals, getDeal, createDeal, updateDeal, deleteDeal, getPipelineStats } = require('../controllers/dealController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.get('/pipeline-stats', getPipelineStats);
router.route('/').get(getDeals).post(createDeal);
router.route('/:id').get(getDeal).put(updateDeal).delete(deleteDeal);
module.exports = router;
