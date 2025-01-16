const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');

router.get('/', (req, res) => CategoryController.getCategories(req, res));
router.post('/create', (req, res) => CategoryController.createCategory(req, res));
router.post('/edit', (req, res) => CategoryController.editCategory(req, res));
router.post('/:id/delete', (req, res) => CategoryController.deleteCategory(req, res));

module.exports = router; 