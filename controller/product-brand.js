// Require Main Modules..
const {validationResult} = require('express-validator');
const Brand = require('../models/product-brand');
const Product = require('../models/product');

exports.addBrand = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }


    try {

        const data = req.body;
        const dataExists = await Brand.findOne({brandSlug: data.brandSlug}).lean();

        if (dataExists) {
            const error = new Error('A product brand with this name/slug already exists');
            error.statusCode = 406;
            next(error)
        } else {
            const brand = new Brand(data);
            const response = await brand.save();
            res.status(200).json({
                response,
                message: 'Brand Added Successfully!'
            });
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.insertManyBrand = async (req, res, next) => {

    try {
        const data = req.body;
        await Brand.deleteMany({});
        const result = await Brand.insertMany(data);

        res.status(200).json({
            message: `${result && result.length ? result.length : 0} Brands imported Successfully!`
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getAllBrands = async (req, res, next) => {


    try {
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.page;
        const select = req.query.select;
        let query = Brand.find({readOnly: {$ne: true}}).select(select ?  select : '');

        if (pageSize && currentPage) {
            query.skip(pageSize * (currentPage - 1)).limit(pageSize)
        }
        const data = await query;
        const count = await Brand.countDocuments();

        res.status(200).json({
            data: data,
            count: count
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getBrandByBrandId = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const brandId = req.params.brandId;
    const brand = await Brand.findOne({_id: brandId});

    try {
        res.status(200).json({
            data: brand,
            // message: 'Brand Added Successfully!'
        });
    } catch (err) {
        console.log(err)
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.editBrandData = async (req, res, next) => {

    const updatedData = req.body;

    try {
        await Brand.updateOne({_id: updatedData._id}, {$set: updatedData});
        await Product.updateMany({brand: updatedData._id}, {brandSlug: updatedData.brandSlug});
        res.status(200).json({
            message: 'Brand Updated Successfully!'
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

exports.getParentCategoriesBySearch = async (req, res, next) => {
    try {

        const search = req.query.q;
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.currentPage;
        const newQuery = search.split(/[ ,]+/);
        const queryArray = newQuery.map((str) => ({brandName: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')

        let productBrands = Brand.find({
            $or: [
                { $and: queryArray }
            ]
        });

        if (pageSize && currentPage) {
            productBrands.skip(pageSize * (currentPage - 1)).limit(Number(pageSize))
        }

        const results = await productBrands;
        const count = results.length;


        res.status(200).json({
            data: results,
            count: count
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

// exports.deleteBrandByBrandId = async (req, res, next) => {
//
//     const brandId = req.params.brandId;
//     await Brand.deleteOne({_id: brandId});
//
//     try {
//         res.status(200).json({
//             message: 'Brand Deleted Successfully',
//         });
//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

exports.deleteBrandByBrandId = async (req, res, next) => {

    const brandId = req.params.brandId;
    console.log(brandId);

    const defaultBrand = await Brand.findOne({readOnly: true});

    // await Product.updateMany({brand: brandId}, { $set: { brand: defaultBrand._id, brandSlug: defaultBrand.brandSlug } })
    await Brand.deleteOne({_id: brandId});

    try {
        res.status(200).json({
            message: 'Brand Deleted Successfully',
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
