const BaseController = require('./BaseController');
const { Category, Document } = require('../models');
const slugify = require('../utils/slugify');

class CategoryController extends BaseController {
    constructor() {
        super();
        this.model = Category;
    }

    async getCategories(req, res) {
        try {
            const categories = await this.buildCategoryTree();
            return this.render(res, 'categories/index', {
                categories,
                title: 'Quản lý danh mục'
            });
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async buildCategoryTree() {
        try {
            const categories = await Category.findAll({
                include: [
                    {
                        model: Document,
                        attributes: ['id', 'title', 'slug', 'content', 'createdAt', 'updatedAt'],
                        separate: true,
                        order: [['createdAt', 'ASC']]
                    }
                ],
                where: {
                    parentId: null
                },
                order: [
                    ['slot', 'ASC'],
                    ['name', 'ASC']
                ]
            });

            const tree = [];
            for (const category of categories) {
                const children = await this.loadChildren(category);
                const documentsCount = await Document.count({
                    where: { categoryId: category.id }
                });

                const categoryJson = category.toJSON();
                categoryJson.documentsCount = documentsCount;
                categoryJson.children = children;
                categoryJson.documents = category.Documents.sort((a, b) => 
                    new Date(a.createdAt) - new Date(b.createdAt)
                );

                tree.push(categoryJson);
            }

            return tree;
        } catch (error) {
            console.error('Error building category tree:', error);
            return [];
        }
    }

    async loadChildren(category) {
        const children = await Category.findAll({
            include: [
                {
                    model: Document,
                    attributes: ['id', 'title', 'slug', 'content', 'createdAt', 'updatedAt'],
                    separate: true,
                    order: [['createdAt', 'ASC']]
                }
            ],
            where: {
                parentId: category.id
            },
            order: [
                ['slot', 'ASC'],
                ['name', 'ASC']
            ]
        });

        if (children.length > 0) {
            const childrenTree = [];
            for (const child of children) {
                const grandChildren = await this.loadChildren(child);
                const documentsCount = await Document.count({
                    where: { categoryId: child.id }
                });

                const childJson = child.toJSON();
                childJson.documentsCount = documentsCount;
                childJson.children = grandChildren;
                childJson.documents = child.Documents.sort((a, b) => 
                    new Date(a.createdAt) - new Date(b.createdAt)
                );

                childrenTree.push(childJson);
            }
            return childrenTree;
        }
        return [];
    }

    async createCategory(req, res) {
        try {
            const { name, parentId, slot } = req.body;
            await this.model.create({
                name,
                slug: slugify(name),
                parentId: parentId || null,
                slot: parseInt(slot) || 0
            });
            return res.redirect('/categories');
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async editCategory(req, res) {
        try {
            const { id, name, parentId, slot } = req.body;
            const category = await this.model.findByPk(id);
            
            if (!category) {
                return this.handleError(res, new Error('Không tìm thấy danh mục'));
            }
            
            // Kiểm tra không cho phép chọn chính nó hoặc con của nó làm cha
            if (parentId && (parentId === id || await this.isDescendant(id, parentId))) {
                return this.handleError(res, new Error('Không thể chọn danh mục này làm cha'));
            }
            
            category.name = name;
            category.slug = slugify(name);
            category.parentId = parentId || null;
            category.slot = parseInt(slot) || 0;
            await category.save();
            
            return res.redirect('/categories');
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    async deleteCategory(req, res) {
        try {
            const category = await this.model.findByPk(req.params.id);
            
            if (!category) {
                return this.handleError(res, new Error('Không tìm thấy danh mục'));
            }
            
            // Kiểm tra có tài liệu trong danh mục
            const documentsCount = await Document.count({
                where: { categoryId: category.id }
            });
            
            if (documentsCount > 0) {
                return this.handleError(res, new Error('Không thể xóa danh mục đang có tài liệu'));
            }
            
            // Kiểm tra có danh mục con
            const childrenCount = await this.model.count({
                where: { parentId: category.id }
            });
            
            if (childrenCount > 0) {
                return this.handleError(res, new Error('Không thể xóa danh mục đang có danh mục con'));
            }
            
            await category.destroy();
            return res.redirect('/categories');
        } catch (error) {
            return this.handleError(res, error);
        }
    }

    // Helper method to check if categoryId is a descendant of parentId
    async isDescendant(categoryId, parentId) {
        const parent = await this.model.findByPk(parentId);
        if (!parent) return false;
        if (parent.parentId === categoryId) return true;
        if (parent.parentId) return await this.isDescendant(categoryId, parent.parentId);
        return false;
    }
}

module.exports = new CategoryController(); 