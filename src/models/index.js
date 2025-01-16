const Category = require('./Category');
const Document = require('./Document');

// Set up relationships
Category.hasMany(Document, { foreignKey: 'categoryId' });
Document.belongsTo(Category, { foreignKey: 'categoryId' });

module.exports = {
    Category,
    Document
}; 