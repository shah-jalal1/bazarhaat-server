// Require Main Modules..
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Require Post Schema from Model..
const Admin = require('../models/admin');
const User = require("../models/user");

exports.adminLogin = async (req, res, next) => {
    // console.log("admin login");

    const username = req.body.username;
    const password = req.body.password;

    let loadedAdmin;
    let token;

    try {

        const admin = await Admin.findOne({username: username});

        if (!admin) {
            res.status(200).json({
                message: 'A Admin with this username could not be found!',
                success: false
            });
        } else if(admin.hasAccess === false) {
            res.status(200).json({
                message: 'Permission Denied. Please contact higher authorize person.',
                success: false
            });
        } else {
            loadedAdmin = admin;
            const isEqual = bcrypt.compareSync(password, admin.password);

            if (!isEqual) {
                res.status(200).json({
                    message: 'You entered a wrong password!',
                    success: false
                });
            } else {
                // For Json Token Generate..
                token = jwt.sign({
                        username: loadedAdmin.username,
                        userId: loadedAdmin._id
                    },
                    process.env.JWT_PRIVATE_KEY_ADMIN, {
                        expiresIn: '24h'
                    }
                );

                const data = await Admin.findOne({_id: loadedAdmin._id})
                    .select('role');

                // Final Response
                res.status(200).json({
                    message: 'Login Success',
                    success: true,
                    token: token,
                    role:  data.role,
                    expiredIn: 86400
                })
            }
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        console.log(err)
        next(err);
    }
}