const { render } = require('ejs');
const db = require('../config/connection');
const { findOne } = require('../model/usermodel');
const myDb = require('../model/usermodel');
const cart = require('../model/cartmodel');
const order = require('../model/ordermodel');
const myProduct = require('../model/productmodel');
const myCategory = require('../model/categorymodel');
const mySubcategory = require('../model/subcategory');
const coupon = require('../model/couponmodel');
const banner=require('../model/bannermodal');
const auth = require('../utils/auth');
const newOtp = require('../model/otpmodel');
const nodemailer = require('nodemailer');
const authen = require('../utils/auth');
const profile = require('../model/profile');
const moment = require('moment');
const dotenv = require("dotenv");
dotenv.config();
const instance = require('../middlewares/razorpay');
const crypto = require('crypto');



const getShop= async (req, res) => {
    // const session = req.session.email;
    // const category = await myCategory.find({});
    // const product = await myProduct.find({ unlist: false }).populate('category');
    // let productCount = await myProduct.find({ unlist: false }).count();
    // res.render('users/shop', { session, product, category, productCount });


    const session = req.session.email;
    const category = await myCategory.find({});
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const product = await myProduct.find({ unlist: false })
        .populate('category')
        .skip(startIndex)
        .limit(limit)
        .exec();

    const productCount = await myProduct.countDocuments({ unlist: false });

    const results = {};
    if (endIndex < productCount) {
        results.next = {
            page: page + 1,
            limit: limit
        };
    }

    if (startIndex > 0) {
        results.previous = {
            page: page - 1,
            limit: limit
        };
    }

    res.render('users/shop', { session, product, category, results });

}

const getSubcategory= async (req, res) => {

    const categoryID = req.body.category;
    const categoryId = mongoose.Types.ObjectId(categoryID);
    console.log(categoryId);
    const subcategories = await mySubcategory.find({ categoryid: categoryId });
    console.log(subcategories);
    res.json(subcategories);
}

// shop

const sortProducts= async (req, res) => {

    try {
        let session = req.session.email;
        let products = await myProduct.find({ unlist: false }).populate('category');
        let sortedProducts;
        let product;

        let sortby = req.body.sortby;

        if (sortby == "asending") {
            sortedProducts = products.sort((a, b) => a.productname.localeCompare(b.productname));
            product = sortedProducts;
            res.json({ product, session })

        } else if (sortby == "decending") {
            sortedProducts = products.sort((a, b) => b.productname.localeCompare(a.productname));
            product = sortedProducts;
            res.json({ product, session })
        } else if (sortby === "price_asc") {
            sortedProducts = products.sort((a, b) => a.price - b.price);
            product = sortedProducts;
            res.json({ product, session })
        } else if (sortby === "price_des") {
            sortedProducts = products.sort((a, b) => b.price - a.price);
            product = sortedProducts;
            res.json({ product, session })
        }

    } catch (err) {
        res.redirect('/error');
    }





}

const filterProducts= async (req, res) => {
    let session = req.session.email;

    try {
        console.log("hey filter")
        let products = await myProduct.find({ unlist: false, category: req.body.categoryId }).populate('category');

        console.log("heyy", products);

        res.status(200).send({ products, session });



    } catch (err) {
        res.redirect('/error');
    }



}

const doSearch= async (req, res) => {
    let session = req.session.email;
    console.log(req.body.searchtext);
    const category = await myCategory.find({});
    let product = await myProduct.find({ productname: new RegExp(req.body.searchtext) }).populate('category');
    console.log(product);
    let results;
    if (product) {
        res.json({product})
    }
}

module.exports={getShop,getSubcategory,sortProducts,filterProducts,doSearch}