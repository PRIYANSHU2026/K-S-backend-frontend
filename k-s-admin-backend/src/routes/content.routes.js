const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public routes for fetching content
router.get('/', contentController.getAllContent);
router.get('/section/:section', contentController.getContentBySection);
router.get('/:id', contentController.getContentById);

// Admin routes for managing content (protected)
router.post('/',
  [authenticate, authorize('content.edit')],
  contentController.createContent
);

router.put('/:id',
  [authenticate, authorize('content.edit')],
  contentController.updateContent
);

router.delete('/:id',
  [authenticate, authorize('content.edit')],
  contentController.deleteContent
);

module.exports = router;
