const loadCategories = require('./loadCategories');

async function refreshCategories(req, res, next) {
    const oldRender = res.render;
    res.render = async function() {
        await loadCategories(req, res, () => {});
        oldRender.apply(res, arguments);
    };
    next();
}

module.exports = refreshCategories; 