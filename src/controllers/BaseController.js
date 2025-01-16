class BaseController {
  constructor() {
    if (this.constructor === BaseController) {
      throw new Error('Không thể khởi tạo trực tiếp BaseController');
    }
  }

  // Phương thức xử lý lỗi chung
  handleError(res, error, view = 'error') {
    console.error(error);
    return res.status(500).render(view, { 
      error: error.message || 'Có lỗi xảy ra',
      title: 'Lỗi'
    });
  }

  // Phương thức render view với data
  render(res, view, data = {}) {
    const defaultData = {
      title: 'Tài liệu lập trình',
      ...data
    };
    return res.render(view, defaultData);
  }
}

module.exports = BaseController; 