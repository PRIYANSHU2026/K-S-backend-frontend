const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public route for submitting contact forms
router.post('/', contactController.submitContactForm);

// Admin routes for managing contact form submissions (protected)
router.get('/',
  [authenticate, authorize('contact.view')],
  contactController.getAllSubmissions
);

router.get('/:id',
  [authenticate, authorize('contact.view')],
  contactController.getSubmissionById
);

router.delete('/:id',
  [authenticate, authorize('contact.delete')],
  contactController.deleteSubmission
);

module.exports = router;
