// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/shipping-charge');
const checkAdminAuth = require('../middileware/check-admin-auth');
const checkIpWhitelist = require('../middileware/check-ip-whitelist');
const router = express.Router();

/**
 * shipping-charge
 * http://localhost:3000/api/shipping-charge
 */


 router.post('/set-extra-price-info', controller.setExtraPriceInfo);
//  router.post('/set-extra-price-info',checkIpWhitelist,checkAdminAuth, controller.setExtraPriceInfo);
 router.get('/get-extra-price-info', controller.getExtraPriceInfo);
 router.put('/edit-extra-info', controller.editExtraInfo);
 

// Export All router..
module.exports = router;
