const express = require('express');

const controller = require('../controller/admin');
// const inputValidator = require('../validation/admin');
const checkAdminAuth = require('../middileware/check-admin-auth');
// const checkIpWhitelist = require('../middileware/check-ip-whitelist');

// Get Express Router Function..
const router = express.Router();

router.put('/login', controller.adminLogin);

module.exports = router;