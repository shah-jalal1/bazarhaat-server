// Require Main Modules..
const {validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Require Post Schema from Model..
const shippingCharge = require('../models/shipping-charge');

exports.setExtraPriceInfo = async (req, res, next) => {
    try {
        const dataModel = new shippingCharge(req.body);
        await dataModel.save();

        res.status(200).json({
            message: 'Extra Price Info Set Successfully!'
        });
    } catch (err) {
        console.log(err);
        if (!err.statusCode) {
        
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.getExtraPriceInfo = async (req, res, next) => {
    try {
        if (req.query.q) {
            const data = await shippingCharge.find().select(req.query.q);
            res.status(200).json({
                data: data[0],
                message: 'All data fetch Successfully!'
            });
        } else {
            const data = await shippingCharge.find();
            res.status(200).json({
                data: data[0],
                message: 'All data fetch Successfully!'
            });
        }
    } catch (err) {
        console.log(err);
        if (!err.statusCode) {

            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.editExtraInfo= async (req, res, next) => {
    try {
        const updatedData = req.body;
        await shippingCharge.findOneAndUpdate(
            {},
            {$set: updatedData}
        );
        res.status(200).json({
            message: 'Data updated Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}