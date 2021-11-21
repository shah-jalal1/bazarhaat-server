// Main Module Required..
const express = require('express');

// Created Require Files..
const controller = require('../controller/user');
const inputValidator = require('../validation/user');
const checkAuth = require('../middileware/check-user-auth');


const router = express.Router();

/**
 * /api/user
 * http://localhost:3000/api/user
 */
 router.get('/',(req, res)=> {
    res.send("From User Route");
});

router.post('/registration', controller.userRegistrationDefault);
router.put('/login', controller.userLoginDefault);
router.get('/logged-in-user-data', checkAuth, controller.getLoginUserInfo);
router.put('/edit-logged-in-user-data', checkAuth, controller.editLoginUserInfo);
// router.post('/get-all-user-lists', checkAdminAuth, controller.getUserLists);
// router.get('/check-user-by-phone/:phoneNo', controller.checkUserByPhone);
// router.get('/get-user-by-user-id/:userId', checkAdminAuth, controller.getUserByUserId);



// Export All router..
module.exports = router;