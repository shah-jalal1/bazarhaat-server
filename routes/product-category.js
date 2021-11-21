// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/product-category');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');
const router = express.Router();

/**
 * /product-category
 * http://localhost:3000/api/product-category
 */


router.post('/add-category', controller.addCategory);
// router.post('/add-category',checkIpWhitelist,checkAdminAuth, controller.addCategory);
router.post('/add-category',checkIpWhitelist,checkAdminAuth, controller.addCategory);
router.post('/add-multiple-category',checkIpWhitelist,checkAdminAuth, controller.insertManyCategory);
router.get('/get-all-categories', controller.getAllCategory);
router.get('/get-category-by-category-id/:categoryId', controller.getCategoryByCategoryId);
// router.put('/edit-category-by-category',checkIpWhitelist,checkAdminAuth, controller.editCategoryData);
router.put('/edit-category-by-category', controller.editCategoryData);
router.post('/get-categories-by-search', controller.getCategoriesBySearch);
router.get('/get-category-by-category-slug/:categorySlug', controller.getCategoryByCategorySlug);
// router.delete('/delete-category-by-id/:categoryId',checkIpWhitelist,checkAdminAuth, controller.deleteCategoryByCategoryId);
router.delete('/delete-category-by-id/:categoryId', controller.deleteCategoryByCategoryId);

// Export All router..
module.exports = router;
