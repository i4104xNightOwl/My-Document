const { Category } = require('../models');

async function loadCategories(req, res, next) {
    try {
        const CategoryController = require('../controllers/CategoryController');
        res.locals.categories = await CategoryController.buildCategoryTree();
        next();
    } catch (error) {
        console.error('Lỗi load categories:', error);
        res.locals.categories = [];
        next();
    }
}

module.exports = loadCategories; 