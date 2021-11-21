const express = require('express');

// Created Require Files..
const controller = require('../controller/product');
// const inputValidator = require('../validation/product');
const checkAuth = require('../middileware/check-user-auth');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');
// Get Express Router Function..
const router = express.Router();

router.post('/add-single-product', controller.addSingleProduct);
// router.post('/add-single-product',checkIpWhitelist,checkAdminAuth, controller.addSingleProduct);
router.post('/get-all-products', controller.getAllProducts);
router.delete('/delete-product-by-id/:id', controller.deleteProductById);
// router.delete('/delete-product-by-id/:id',checkIpWhitelist,checkAdminAuth, checkAdminAuth, controller.deleteProductById);
router.put('/edit-product-by-id', controller.updateProductById);
// router.put('/edit-product-by-id',checkIpWhitelist,checkAdminAuth, checkAdminAuth, controller.updateProductById);
router.get('/get-single-product-by-id/:id', controller.getSingleProductById);

router.get('/get-single-product-by-slug/:slug', controller.getSingleProductBySlug);

router.post('/get-specific-products-by-ids', controller.getSpecificProductsByIds);

router.post('/product-filter-query', controller.productFilterByQuery);

router.post('/get-products-by-search', controller.getProductsBySearch);

module.exports = router;