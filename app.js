const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const database = require('./src/config/database');
const routes = require('./src/routes');
const expressLayouts = require('express-ejs-layouts');
const models = require('./src/models');
const loadCategories = require('./src/middleware/loadCategories');
const refreshCategories = require('./src/middleware/refreshCategories');

class App {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddlewares() {
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'src/views'));
    this.app.use(express.static(path.join(__dirname, 'public')));
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
    this.app.use(expressLayouts);
    this.app.set('layout', 'layouts/main');
    this.app.use(loadCategories);
    this.app.use(refreshCategories);
  }

  setupRoutes() {
    this.app.use('/', routes);
  }

  setupErrorHandling() {
    this.app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).render('error', { error: err });
    });
  }

  async start() {
    try {
      await database.sync();
      const port = process.env.PORT || 3000;
      this.app.listen(port, () => {
        console.log(`Server đang chạy tại http://localhost:${port}`);
      });
    } catch (error) {
      console.error('Lỗi khởi động server:', error);
      process.exit(1);
    }
  }
}

const app = new App();
app.start(); 