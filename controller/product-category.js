// Require Main Modules..
const {validationResult} = require('express-validator');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// Require Post Schema from Model..
const ProductCategory = require('../models/product-category');
const Product = require('../models/product');
// const ProductSubCategory = require('../models/product-sub-category');


exports.addCategory = async (req, res, next) => {
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
        const dataExists = await ProductCategory.findOne({categorySlug: data.categorySlug}).lean();
        if (dataExists) {
            const error = new Error('A product category with this name/slug already exists');
            error.statusCode = 406;
            next(error)
        } else {
            const productCategory = new ProductCategory(data);
            const response = await productCategory.save();
            res.status(200).json({
                response,
                message: 'Category Added Successfully!'
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

exports.insertManyCategory = async (req, res, next) => {

    try {
        const data = req.body;
        await ProductCategory.deleteMany({});
        const result = await ProductCategory.insertMany(data);

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


exports.getAllCategory = async (req, res, next) => {

    try {
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.page;
        let select = req.query.select;

        let query = ProductCategory.find({readOnly: {$ne: true}});
        // if(select) {
        //     query = query.select(select)
        // } else {
        //     query.populate('attributes')
        // }

        if (pageSize && currentPage) {
            query.skip(pageSize * (currentPage - 1)).limit(pageSize)
        }
        const data = await query;
        const count = await ProductCategory.countDocuments();

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

exports.getCategoryByCategoryId = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const categoryId = req.params.categoryId;
    const productCategory = await ProductCategory.findOne({_id: categoryId});

    try {
        res.status(200).json({
            data: productCategory,
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

exports.editCategoryData = async (req, res, next) => {

    const updatedData = req.body;

    try {
        await ProductCategory.updateOne({_id: updatedData._id}, {$set: updatedData});

        await Product.updateMany({category: updatedData._id}, {categorySlug: updatedData.categorySlug});

        res.status(200).json({
            message: 'SubCategory Updated Successfully!'
        });

        res.status(200).json({
            message: 'Category Updated Successfully!'
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

exports.getCategoriesBySearch = async (req, res, next) => {
    try {

        const search = req.query.q;
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.currentPage;
        const newQuery = search.split(/[ ,]+/);
        const queryArray = newQuery.map((str) => ({categoryName: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')

        let productCategories = ProductCategory.find({
            $or: [
                { $and: queryArray }
            ]
        });

        if (pageSize && currentPage) {
            productCategories.skip(pageSize * (currentPage - 1)).limit(Number(pageSize))
        }

        const results = await productCategories;
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

exports.getCategoryByCategorySlug = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Input Validation Error! Please complete required information.');
        error.statusCode = 422;
        error.data = errors.array();
        next(error)
        return;
    }

    const categorySlug = req.params.categorySlug;
    const productCategory = await ProductCategory
        .findOne({categorySlug: categorySlug})
        .populate('attributes')


    try {
        res.status(200).json({
            data: productCategory,
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

// exports.deleteCategoryByCategoryId = async (req, res, next) => {
//
//     const categoryId = req.params.categoryId;
//     await ProductCategory.deleteOne({_id: categoryId});
//
//     try {
//         res.status(200).json({
//             message: 'Category Deleted Successfully',
//         });
//     } catch (err) {
//         if (!err.statusCode) {
//             err.statusCode = 500;
//             err.message = 'Something went wrong on database operation!'
//         }
//         next(err);
//     }
// }

exports.deleteCategoryByCategoryId = async (req, res, next) => {
    // console.log(res);

    const categoryId = req.params.categoryId;
    console.log(categoryId);
    const defaultCategory = await ProductCategory.findOne({readOnly: true});
    // const defaultSubCategory = await ProductSubCategory.findOne({readOnly: true});
    await Product.updateMany({category: categoryId}, { $set : { category: defaultCategory._id, categorySlug: defaultCategory.categorySlug, subCategory: defaultSubCategory._id, subCategorySlug: defaultSubCategory.subCategorySlug } });
    // await ProductSubCategory.deleteMany({category: categoryId});
    await ProductCategory.deleteOne({_id: categoryId});

    try {
        res.status(200).json({
            message: 'Category Deleted Successfully',
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}
