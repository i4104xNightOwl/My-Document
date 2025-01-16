const BaseController = require('./BaseController');
const { Document, Category } = require('../models');
const slugify = require('../utils/slugify');
const { Op } = require('sequelize');

class DocumentController extends BaseController {
	constructor() {
		super();
		this.model = Document;
	}

	async getAllDocuments(req, res) {
		try {
			const categories = await this.buildCategoryTree();

			return this.render(res, 'documents/index', {
				categories,
				title: 'Tài liệu'
			});
		} catch (error) {
			return this.handleError(res, error);
		}
	}

	async getCreateForm(req, res) {
		const categories = await this.buildCategoryTree();
		return this.render(res, 'documents/create', {
			title: 'Tạo tài liệu mới',
			categories,
			req
		});
	}

	async buildCategoryTree() {
		const CategoryController = require('./CategoryController');
		return await CategoryController.buildCategoryTree();
	}

	async createDocument(req, res) {
		try {
			const { title, content, categoryId } = req.body;

			// Validate input
			if (!title || !content) {
				throw new Error('Tiêu đề và nội dung không được để trống');
			}

			if (!categoryId) {
				throw new Error('Vui lòng chọn danh mục cho tài liệu');
			}

			// Check if category exists
			const category = await Category.findByPk(categoryId);
			if (!category) {
				throw new Error('Danh mục không tồn tại');
			}

			const document = await this.model.create({
				title,
				content,
				categoryId,
				slug: slugify(title)
			});

			return res.redirect(`/documents/${document.slug}`);
		} catch (error) {
			const categories = await this.buildCategoryTree();
			return this.render(res, 'documents/create', {
				error: error.message,
				formData: req.body,
				title: 'Tạo tài liệu mới',
				categories,
				req
			});
		}
	}

	async getDocument(req, res) {
		try {
			const document = await this.findBySlug(req.params.slug);
			if (!document) {
				return this.handleError(res, new Error('Không tìm thấy tài liệu'), 404);
			}

			// Lấy bài viết trước và sau trong cùng category
			const [prevDoc, nextDoc] = await Promise.all([
				this.model.findOne({
					where: {
						categoryId: document.categoryId,
						createdAt: {
							[Op.lt]: document.createdAt
						}
					},
					order: [['createdAt', 'DESC']]
				}),
				this.model.findOne({
					where: {
						categoryId: document.categoryId,
						createdAt: {
							[Op.gt]: document.createdAt
						}
					},
					order: [['createdAt', 'ASC']]
				})
			]);

			return this.render(res, 'documents/show', {
				document,
				prevDoc,
				nextDoc,
				title: document.title
			});
		} catch (error) {
			return this.handleError(res, error);
		}
	}

	async getEditForm(req, res) {
		try {
			const document = await this.findBySlug(req.params.slug);
			if (!document) {
				return this.handleError(res, new Error('Không tìm thấy tài liệu'), 404);
			}

			const categories = await this.buildCategoryTree();

			return this.render(res, 'documents/edit', {
				document,
				categories,
				title: `Sửa: ${document.title}`
			});
		} catch (error) {
			return this.handleError(res, error);
		}
	}

	async updateDocument(req, res) {
		try {
			const document = await this.findBySlug(req.params.slug);
			if (!document) {
				return this.handleError(res, new Error('Không tìm thấy tài liệu'), 404);
			}

			const { title, content, categoryId } = req.body;

			// Validate input
			if (!title || !content) {
				throw new Error('Tiêu đề và nội dung không được để trống');
			}

			if (!categoryId) {
				throw new Error('Vui lòng chọn danh mục cho tài liệu');
			}

			// Check if category exists
			const category = await Category.findByPk(categoryId);
			if (!category) {
				throw new Error('Danh mục không tồn tại');
			}

			document.title = title;
			document.content = content;
			document.categoryId = categoryId;
			document.slug = slugify(title);

			await document.save();
			return res.redirect(`/documents/${document.slug}`);
		} catch (error) {
			const categories = await this.buildCategoryTree();
			return this.render(res, 'documents/edit', {
				error: error.message,
				document: req.body,
				categories,
				title: 'Sửa tài liệu'
			});
		}
	}

	async deleteDocument(req, res) {
		try {
			const document = await this.findBySlug(req.params.slug);
			if (!document) {
				return this.handleError(res, new Error('Không tìm thấy tài liệu'), 404);
			}

			await document.destroy();
			if (req.xhr) {
				return res.json({ success: true });
			} else {
				return res.redirect('/documents');
			}
		} catch (error) {
			if (req.xhr) {
				return res.status(500).json({ error: error.message });
			} else {
				return this.handleError(res, error);
			}
		}
	}

	async searchDocuments(req, res) {
		try {
			const { q, category } = req.query;
			const documents = await this.search(q, category);

			return this.render(res, 'documents/index', {
				documents,
				searchQuery: q,
				category,
				title: 'Kết quả tìm kiếm'
			});
		} catch (error) {
			return this.handleError(res, error);
		}
	}

	// Helper methods
	async findBySlug(slug) {
		return await this.model.findOne({
			where: { slug }
		});
	}

	async search(query, category) {
		const whereClause = {};

		if (query) {
			whereClause[Op.or] = [
				{ title: { [Op.like]: `%${query}%` } },
				{ content: { [Op.like]: `%${query}%` } }
			];
		}

		if (category) {
			whereClause.category = category;
		}

		return await this.model.findAll({
			where: whereClause,
			order: [['createdAt', 'ASC']]
		});
	}

	async handleError(res, error, status = 500) {
		const title = 'Lỗi';
		if (status === 404) {
			return res.status(404).render('error', { error: error.message, title });
		}
		return res.status(500).render('error', { error: error.message, title });
	}
}

module.exports = new DocumentController(); 