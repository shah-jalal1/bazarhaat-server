const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema(
    {
        fullName: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: false
        },
        phoneNo: {
            type: String,
            required: false
        },
        email: {
            type: String,
            required: false
        },
        gender: {
            type: String,
            required: false
        },
        birthdate: {
            type: Date,
            required: false
        },
        username: {
            type: String,
            required: true
        },
        occupation: {
            type: String,
            required: false
        },
        profileImg: {
            type: String
        },
        password: {
            type: String,
            required: false
        },
        isPhoneVerified: {
            type: Boolean,

            required: true
        },
        isEmailVerified: {
            type: Boolean,
            required: false
        },
        registrationType: {
            type: String,
            required: true
        },
        registrationAt: {
            type: Date,
            default: Date.now(),
            required: true,
        },
        hasAccess: {
            type: Boolean,
            required: true
        },
        carts: [{
            type: Schema.Types.ObjectId,
            ref: 'Cart'
        }],
        checkouts: [{
            type: Schema.Types.ObjectId,
            ref: 'Order'
        }],
        prescriptionOrders: [{
            type: Schema.Types.ObjectId,
            ref: 'PrescriptionOrder'
        }],
        addresses: [{
            type: Schema.Types.ObjectId,
            ref: 'Address'
        }],
        wishlists: [{
            type: Schema.Types.ObjectId,
            ref: 'Wishlist'
        }],
        usedCoupons: [{
            type: Schema.Types.ObjectId,
            ref: 'Coupon'
        }],
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model('User', userSchema);
