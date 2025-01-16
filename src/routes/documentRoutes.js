const express = require('express');
const router = express.Router();
const DocumentController = require('../controllers/DocumentController');

// Bind context cho các method của controller
const bindMethod = (method) => {
  return method.bind(DocumentController);
};

router.get('/', bindMethod(DocumentController.getAllDocuments));
router.get('/create', bindMethod(DocumentController.getCreateForm));
router.post('/create', bindMethod(DocumentController.createDocument));
router.get('/search', bindMethod(DocumentController.searchDocuments));
router.get('/:slug', bindMethod(DocumentController.getDocument));
router.get('/:slug/edit', bindMethod(DocumentController.getEditForm));
router.post('/:slug/edit', bindMethod(DocumentController.updateDocument));
router.post('/:slug/delete', bindMethod(DocumentController.deleteDocument));

module.exports = router; 