const express = require('express');
const router = express.Router();
const documentRoutes = require('./documentRoutes');
const categoryRoutes = require('./categoryRoutes');

router.get('/', (req, res) => {
  res.redirect('/documents');
});

router.use('/documents', documentRoutes);
router.use('/categories', categoryRoutes);

module.exports = router; 