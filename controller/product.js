const {validationResult} = require('express-validator');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Require Post Schema from Model..
const Product = require('../models/product');

const ObjectId = require('mongoose').Types.ObjectId;

exports.addSingleProduct = async (req, res, next) => {
    console.log("add product");

    try {
        const data = req.body;
        const dataExists = await Product.findOne({productSlug: data.productSlug}).lean();

        if (dataExists) {
            const error = new Error('A product with this name/slug already exists');
            error.statusCode = 406;
            next(error)
        } else {
            const product = new Product(data);
            // PRODUCT
            await product.save();
            res.status(200).json({
                message: 'Product Added Successfully!'
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

exports.getSingleProductBySlug = async (req, res, next) => {
    const productSlug = req.params.slug;
    try {
        const query = {productSlug: productSlug};
        const data = await Product.findOne(query)
            .populate('brand')
            .populate('category')
            // .populate('subCategory')
            // // .populate('generic')
            .populate({
                path: 'prices.unit',
                model: 'UnitType'
            })

        res.status(200).json({
            data: data,
            message: 'Product fetch Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

// exports.getSingleProductBySlug = async (req, res, next) => {
//     const productSlug = req.params.slug;
//     console.log("Product Slug: ", productSlug);
//     try {
//       const query = { productSlug: productSlug };
//       console.log("query: ", query);
//       const data = await Product.findOne(query);
//       console.log("data", data);
//       res.status(200).json({
//         data: data,
//         message: "Product fetch Successfully!",
//       });
//     } catch (err) {
//       if (!err.statusCode) {
//         err.statusCode = 500;
//         err.message = "Something went wrong on database operation!";
//       }
//       next(err);
//     }
//   };


exports.getAllProducts = async (req, res, next) => {
    try {
        let paginate = req.body.paginate;
        let filter = req.body.filter;

        let queryData;
        let dataCount;

        let priceRange = {
            minPrice: 0,
            maxPrice: 0
        }
        let minPrice;
        let maxPrice;

        let type = 'default';
        let i = -1;

        if (filter) {

            if ( 'categorySlug' in filter) { type = 'cat'; i = index; };
            // if ( 'tags' in filter) { type = 'tag'; i = index; };

            if (type == 'cat') {
                minPrice = Product.find(filter[i]).sort({price: 1}).limit(1);
                maxPrice = Product.find(filter[i]).sort({price: -1}).limit(1);
            }  else {
                minPrice = Product.find().sort({price: 1}).limit(1);
                maxPrice = Product.find().sort({price: -1}).limit(1);
            }
        } else {
            minPrice = Product.find().sort({price: 1}).limit(1);
            maxPrice = Product.find().sort({price: -1}).limit(1);
        }

        const temp1 = await minPrice;
        const temp2 = await maxPrice;

        priceRange.minPrice = temp1.length > 0 ? temp1[0].price : 0;
        priceRange.maxPrice = temp2.length > 0 ? temp2[0].price : 0;

        if (filter) {
            queryData = Product.find(filter);
        } else {
            queryData = Product.find();
        }

        if (paginate) {
            queryData.skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1)).limit(Number(paginate.pageSize))
        }

        const data = await queryData
            // .populate('attributes')
            .populate('brand')
            .populate('category')
    
            .sort({createdAt: -1})

        if (filter) {
            dataCount = await Product.countDocuments(filter);
        } else {
            dataCount = await Product.countDocuments();
        }


        res.status(200).json({
            data: data,
            priceRange: priceRange,
            count: dataCount
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


exports.getSpecificProductsByIds = async (req, res, next) => {

    try {

        const dataIds = req.body.ids;
        const select = req.body.select;
        const query = {_id: {$in: dataIds}}
        const data = await Product.find(query)
            .select(select ? select : '')
            // .populate('attributes')
            .populate('brand')
            .populate('category')
            .populate('subCategory')
            .populate(
                {
                    path: 'prices.unit',
                    model: 'UnitType'
                }
            )

        res.status(200).json({
            data: data
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}

exports.getSpecificProductsById = async (req, res, next) => {

    try {

        const dataIds = req.body.productId;
        const query = {_id: {$in: dataIds}}
        const data = await Product.find(query).populate('extraData');
            // .select('_id name slug image price discountPercent availableQuantity author authorName');
        console.log('this is compare list')
        console.log(data)
        res.status(200).json({
            data: data
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.deleteProductById = async (req, res, next) => {

    const productId = req.params.id;

    try {
        const query = {_id: productId}
        await Product.deleteOne(query)
        // await Review.deleteOne({product: productId})

        res.status(200).json({
            message: 'Product deleted Successfully!'
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }

}


exports.updateProductById = async (req, res, next) => {

    const data = req.body;
    try {
        await Product.findOneAndUpdate(
            {_id: data._id},
            {$set: data}
        )

        res.status(200).json({
            message: 'Product Update Successfully!'
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



exports.getSingleProductById = async (req, res, next) => {
    const id = req.params.id;

    try {
        const query = {_id: id};
        const data = await Product.findOne(query)
            // .populate('generic')
            .populate('brand')
            .populate('category')
            // .populate('subCategory')
            // .populate({
            //     path: 'prices.unit',
            //     model: 'UnitType',
            //     select: 'name'
            // })

        res.status(200).json({
            data: data,
            message: 'Product fetch Successfully!'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            err.message = 'Something went wrong on database operation!'
        }
        next(err);
    }
}


exports.productFilterByQuery = async (req, res, next) => {

    try {
        const query = req.body.query;
        const paginate = req.body.paginate;
        let queryProduct;

        let priceRange = {
            minPrice: 0,
            maxPrice: 0
        }
        let minPrice;
        let maxPrice;

        let type = 'default';
        let i = -1;

        if (query) {

            query.forEach((item, index) => {
                if ( 'categorySlug' in item) { type = 'cat'; i = index; };
                if ( 'subCategorySlug' in item) { type = 'subCat'; i = index; };
                if ( 'tags' in item) { type = 'tag'; i = index; };
            });

            if (type == 'cat') {
                minPrice = Product.find(query[i]).sort({price: 1}).limit(1);
                maxPrice = Product.find(query[i]).sort({price: -1}).limit(1);
            } else if (type == 'subCat') {
                minPrice = Product.find(query[i]).sort({price: 1}).limit(1);
                maxPrice = Product.find(query[i]).sort({price: -1}).limit(1);
            } else if (type == 'tag') {
                minPrice = Product.find(query[i]).sort({price: 1}).limit(1);
                maxPrice = Product.find(query[i]).sort({price: -1}).limit(1);
            } else {
                minPrice = Product.find().sort({price: 1}).limit(1);
                maxPrice = Product.find().sort({price: -1}).limit(1);
            }
        } else {
            minPrice = Product.find().sort({price: 1}).limit(1);
            maxPrice = Product.find().sort({price: -1}).limit(1);
        }

        const temp1 = await minPrice;
        const temp2 = await maxPrice;

        priceRange.minPrice = temp1.length > 0 ? temp1[0].price : 0;
        priceRange.maxPrice = temp2.length > 0 ? temp2[0].price : 0;


        if (req.body.select) {
            queryProduct = Product.find({$and: query})
                .select(req.body.select)
                .populate('attributes')
                .populate('brand')
                .populate('category')
                .populate('subCategory');
        } else {
            queryProduct = Product.find({$and: query})
                .populate('attributes')
                .populate('brand')
                .populate('category')
                .populate('subCategory');
        }

        if (paginate) {
            queryProduct.skip(Number(paginate.pageSize) * (Number(paginate.currentPage) - 1)).limit(Number(paginate.pageSize))
        }

        const productsCount = await Product.countDocuments({$and: query});
        const result = await queryProduct;

        res.status(200).json({
            data: result,
            priceRange: priceRange,
            count: productsCount
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


exports.getProductsBySearch = async (req, res, next) => {
    try {

        // Query Text
        const search = req.query.q;

        // Additional Filter
        const filter = req.body.filter;

        // Pagination
        const pageSize = +req.query.pageSize;
        const currentPage = +req.query.currentPage;

        // Build Regex Query
        const newQuery = search.split(/[ ,]+/);
        const queryArray = newQuery.map((str) => ({productName: RegExp(str, 'i')}));
        const queryArray2 = newQuery.map((str) => ({sku: RegExp(str, 'i')}));
        // const queryArray3 = newQuery.map((str) => ({phoneNo: RegExp(str, 'i')}));
        // const queryArray4 = newQuery.map((str) => ({username: RegExp(str, 'i')}));
        // const regex = new RegExp(query, 'i')


        let dataDoc;
        let countDoc;

        if (filter) {
            dataDoc = Product.find({
                $and: [
                    filter,
                    {
                        $or: [
                            {$and: queryArray},
                            {$and: queryArray2},
                            // {$and: queryArray3},
                            // {$and: queryArray4},
                        ]
                    }
                ]
            });
            countDoc = dataDoc = Product.countDocuments({
                $and: [
                    filter,
                    {
                        $or: [
                            {$and: queryArray},
                            {$and: queryArray2},
                            // {$and: queryArray3},
                            // {$and: queryArray4},
                        ]
                    }
                ]
            });
        } else {
            dataDoc = Product.find({
                $or: [
                    {$and: queryArray},
                    {$and: queryArray2},
                    // {$and: queryArray3},
                    // {$and: queryArray4},
                ]
            });

            countDoc = Product.countDocuments({
                $or: [
                    {$and: queryArray},
                    {$and: queryArray2},
                    // {$and: queryArray3},
                    // {$and: queryArray4},
                ]
            });
        }


        // {marketer: {$in: [null]}}

        if (pageSize && currentPage) {
            dataDoc.skip(pageSize * (currentPage - 1)).limit(Number(pageSize))
        }

        const results = await dataDoc;
        const count = await countDoc

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


