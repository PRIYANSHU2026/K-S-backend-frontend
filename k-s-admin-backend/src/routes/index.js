const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const categoryRoutes = require('./category.routes');
const customerRoutes = require('./customer.routes');
const warrantyRoutes = require('./warranty.routes');
const roleRoutes = require('./role.routes');
const userRoutes = require('./user.routes');

// Register all routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/warranties', warrantyRoutes);
router.use('/roles', roleRoutes);
router.use('/users', userRoutes);

module.exports = router;
