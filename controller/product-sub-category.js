// Require Main Modules..
const {validationResult} = require('express-validator');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// Require Post Schema from Model..
const ProductSubCategory = require('../models/product-sub-category');
const Product = require('../models/product');

exports.addSubCategory = async (req, res, next) => {
    console.log("add sub category route found");
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
        const dataExists = await ProductSubCategory.findOne({subCategorySlug: data.subCategorySlug}).lean();

        if (dataExists) {
            const error = new Error('A product sub category with this name/slug already exists');
            error.statusCode = 406;
            next(error)
        } else {
            const productSubCategory = new ProductSubCategory(data);
            const response = await productSubCategory.save();
            res.status(200).json({
                response,
                message: 'Sub Category Added Successfully!'
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

exports.insertManySubCategory = async (req, res, next) => {

    try {
        const data = req.body;
        await ProductSubCategory.deleteMany({});
        const result = await ProductSubCategory.insertMany(data);

        res.status(200).json({
            message: `${result && result.length ? result.length : 0} Category imported Successfully!`
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.getAllSubCategory = async (req, res, next) => {
    try {
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.page;
        let query = ProductSubCategory.find({readOnly: {$ne: true}})
            .populate('category')
            .populate('attributes');

        if (pageSize && currentPage) {
            query.skip(pageSize * (currentPage - 1)).limit(pageSize)
        }
        const data = await query;
        const count = await ProductSubCategory.countDocuments();

        res.status(200).json({
            data: data,
            count: count,
            message: 'Sub Category Added Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getSubCategoryBySubCategoryId = async (req, res, next) => {

    try {
        const subCategoryId = req.params.subCategoryId;
        const productSubCategory = await ProductSubCategory.findOne({_id: subCategoryId})
            // .populate('attributes');
        res.status(200).json({
            data: productSubCategory,
            // message: 'Brand Added Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.editSubCategoryData = async (req, res, next) => {

    const updatedData = req.body;

    try {

        await ProductSubCategory.updateOne({_id: updatedData._id}, {$set: updatedData})

        await Product.updateMany({subCategory: updatedData._id}, {subCategorySlug: updatedData.subCategorySlug})
        res.status(200).json({
            message: 'SubCategory Updated Successfully!'
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

exports.getSubCategoriesBySearch = async (req, res, next) => {
    try {

        const search = req.query.q;
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.currentPage;
        const newQuery = search.split(/[ ,]+/);
        const queryArray = newQuery.map((str) => ({subCategoryName: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')

        let productSubCategories = ProductSubCategory.find({
            $or: [
                { $and: queryArray }
            ]
        });

        if (pageSize && currentPage) {
            productSubCategories.skip(pageSize * (currentPage - 1)).limit(Number(pageSize))
        }

        const results = await productSubCategories;
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

exports.getSubCategoryByCategoryId = async (req, res, next) => {

    try {

        const categoryId = req.params.categoryId;
        const productSubCategory = await ProductSubCategory.find({category: categoryId})
            // .populate('attributes');

        res.status(200).json({
            data: productSubCategory,
            // message: 'Brand Added Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getSubCategoryBySubCategorySlug = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const subCategorySlug = req.params.subCategorySlug;
    const productSubCategory = await ProductSubCategory
        .findOne({subCategorySlug: subCategorySlug})
        .populate('attributes')

    try {
        res.status(200).json({
            data: productSubCategory,
            // message: 'Brand Added Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

// exports.deleteSubCategoryBySubCategoryId = async (req, res, next) => {
//
//     const subCategoryId = req.params.subCategoryId;
//     await ProductSubCategory.deleteOne({_id: subCategoryId});
//
//     try {
//         res.status(200).json({
//             message: 'Sub Category Deleted Successfully',
//         });
//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

exports.deleteSubCategoryBySubCategoryId = async (req, res, next) => {

    const subCategoryId = req.params.subCategoryId;
    const defaultSubCategory = await ProductSubCategory.findOne({readOnly: true});
    await Product.updateMany({subCategory: subCategoryId}, {
        $set: {
            subCategory: defaultSubCategory._id,
            subCategorySlug: defaultSubCategory.subCategorySlug
        }
    })
    await ProductSubCategory.deleteOne({_id: subCategoryId});

    try {
        res.status(200).json({
            message: 'Sub Category Deleted Successfully',
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}
