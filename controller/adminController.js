const { render } = require('ejs');
const db = require('../config/connection');
const myDbs = require('../model/usermodel');
const products = require('../model/productmodel');
const coupon = require('../model/couponmodel');
const order = require('../model/ordermodel');
const banner = require('../model/bannermodal');
const myCategory = require('../model/categorymodel');
// const mySubcategory=require('../model/subcategory');
const fs = require('fs');
const moment = require('moment');
const dotenv = require('dotenv');
var bcrypt = require('bcrypt');
const { response } = require('express');
const { default: mongoose } = require('mongoose');
const { nextTick } = require('process');
const { invalid } = require('moment');
dotenv.config();
db.dbConnect();

let msg = "";

module.exports = {
    adminIndex:
        async (req, res) => {
            try {
                const orderData = await order.find({ orderStatus: { $ne: "cancelled" } });
                const totalRevenue = orderData.reduce((accumulator, object) => {
                    return accumulator + object.totalAmount;
                }, 0);
                const todayOrder = await order.find({
                    orderDate: moment().format("MMM Do YY"),
                });
                const todayRevenue = todayOrder.reduce((accumulator, object) => {
                    return accumulator + object.totalAmount;
                }, 0);
                const start = moment().startOf("month");
                const end = moment().endOf("month");
                const oneMonthOrder = await order.find({ orderStatus: { $ne: "cancelled" }, createdAt: { $gte: start, $lte: end }, })
                const monthlyRevenue = oneMonthOrder.reduce((accumulator, object) => {
                    return accumulator + object.totalAmount
                }, 0);
                const allOrders = orderData.length;
                const pending = await order.find({ orderStatus: "pending" }).count();
                const shipped = await order.find({ orderStatus: "shipped" }).count();
                const placed = await order.find({ orderStatus: "placed" }).count();
                const cancelled = await order.find({ orderStatus: "cancelled" }).count();
                const cod = await order.find({ paymentMethod: "COD" }).count();
                const online = await order.find({ paymentMethod: "online" }).count();
                const activeUsers = await myDbs.users.find({ unblockuser: true }).count();
                const product = await products.find({ unlist: false }).count();

                res.render('admin/adminindex', { cod, online, pending, shipped, placed, cancelled, totalRevenue, allOrders, activeUsers, product, monthlyRevenue, todayRevenue });
            } catch (err) {
                console.log(err.message);
                res.redirect('/admin/error');
            }
        },
    adminLogin: (req, res) => {

        res.render("admin/adminlogin", { msg });
        msg = "";
    },
    Users: async (req, res) => {
        try {
            let user = await myDbs.users.find({});
            console.log("showing users")
            res.render("admin/users", { user })
        } catch (err) {
            res.redirect('/admin/error');
        }

    },


    products: async (req, res) => {
        try {

            products.find().populate('category').exec((err, product) => {
                if (err) {
                    console.log("hdkshdshdksahdksahdaskjhdashkdaskdhakj");

                } else {
                    res.render('admin/products', { product: product });
                    console.log("showing products");
                }
            });




        } catch (err) {
            res.redirect('/admin/error');
        }
    },

    getOrders: async (req, res) => {

        try {
            order.aggregate([
                {
                    $lookup: {
                        from: "products",
                        localField: "orderItems.productId",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "users"
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                }
            ]).then((orderDetails) => {
                res.render("admin/orders", { orderDetails });
            })
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },

    adminpost: (req, res) => {
        try {
            const adEmail = process.env.Email;
            const adPassword = process.env.Password;
            const { email, password } = req.body;
            console.log(req.body);
            if (email == adEmail && password == adPassword) {
                req.session.adEmail = adEmail;
                res.redirect("/admin/home");
            } else {
                msg = "Invalid email or password";
                res.redirect("/admin/adminLogin");

            }
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },

    userBlock: async (req, res) => {
        console.log(req.query.id);
        try {
            await myDbs.users.updateOne({ _id: req.query.id }, { $set: { unblockuser: false } });
            res.redirect("/admin/users");
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },
    userUnblock: async (req, res) => {
        console.log(req.query.id);
        try {
            await myDbs.users.updateOne({ _id: req.query.id }, { $set: { unblockuser: true } });
            res.redirect("/admin/users");
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },

    deleteUser: async (req, res) => {
        try {
            console.log(req.query.id);
            let userId = req.query.id;
            await myDbs.users.deleteOne({ _id: userId });
            res.redirect("/admin/users");

        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },


    addproduct: async (req, res) => {
        try {
            let category = await myCategory.find({});

            res.render('admin/addproducts', { category });
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },
    addproducts: async (req, res) => {
        try {

            const myProducts = new products({
                image1: req.files[0].filename,
                image2: req.files[1].filename,
                image3: req.files[2].filename,
                productname: req.body.pname,
                category: req.body.category,
                quantity: req.body.quantity,
                description: req.body.description,
                price: req.body.price,
            });

            console.log(myProducts);

            myProducts.save().then((item) => {


                res.redirect('/admin/products');

            }).catch(err => {

                console.log(err)
                res.redirect('/admin/addproducts')
                console.log('product image addition failed');
            })
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }


    },
    getProduct: async (req, res) => {
        const Id = req.query.id;
        console.log(Id);
        try {
            let item = await products.findOne({ _id: Id }).populate("category");
            let category = await myCategory.find({});


            console.log(item);
            res.render('admin/editproduct', { item, category });
        } catch (err) {
            console.log("get product error")
            res.redirect('/admin/error');
        }
    },
    editProduct: async (req, res) => {


        console.log(req.query.id);
        try {
            //  let image=req.files.map((data)=>{
            // return data?.filename;
            // })

            await products.updateOne({ _id: req.query.id }, {
                $set: {

                    productname: req.body.pname,
                    category: req.body.category,
                    subcategory: req.body.subcategory,
                    quantity: req.body.quantity,
                    description: req.body.description,
                    price: req.body.price,

                }
            }).catch(err => {
                res.redirect('/editproduct');
            })
            console.log('product updated')
            res.redirect('/admin/products');
        } catch (err) {

            console.log('product edit error');
            res.redirect('/admin/editproduct');
        };

    },
    unlistProduct: async (req, res) => {
        try {
            console.log(req.query.id);
            await products.updateOne({ _id: req.query.id }, { $set: { unlist: true } });
            console.log("product unlisted");
            res.redirect('/admin/products');
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }

    },
    listProduct: async (req, res) => {
        try {
            console.log(req.query.id);
            await products.updateOne({ _id: req.query.id }, { $set: { unlist: false } });
            console.log("product listed");
            res.redirect('/admin/products');

        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },

    Category: async (req, res) => {
        try {
            let category = await myCategory.find({});
            console.log("helloooooooo");
            console.log(category);
            res.render('admin/category', { category, msg });
            msg = "";
        } catch (err) {
            res.redirect('/admin/error');
        }
    },

    categoryPost: async (req, res) => {
        try {
            const category = req.body.mycategory;
            console.log(req.body.mycategory);
            console.log(category);

            const categoryLowercase = category.toLowerCase();
            console.log(categoryLowercase);

            const categ = await myCategory.findOne({ categoryname: { $regex: new RegExp(categoryLowercase, "i") } });
            console.log(categ);



            if (categ) {
                const category_Db = categ.categoryname.toLowerCase();
                console.log(category_Db)

                if (categoryLowercase == category_Db) {
                    msg = "Category already added";
                    res.redirect('/admin/category')

                }
            } else {

                const addCategory = new myCategory({
                    categoryname: category,
                    // subcategory:req.body.subcategory,
                });
                addCategory.save().then((item) => {
                    console.log("category added");
                    res.redirect('/admin/category');
                }).catch((err) => {
                    res.redirect('/admin/error');
                })
            }






        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }

    },

    deleteCategory: async (req, res) => {
        try {

            const category = req.params.id;
            console.log(category);
            await myCategory.updateOne({ _id: category }, { isDeleted: true });

            res.redirect('/admin/category');



        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },
    restoreCategory: async (req, res) => {
        try {
            const category = req.params.id;
            await myCategory.updateOne({ _id: category }, { isDeleted: false });

            res.redirect('/admin/category');
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },


    adminLogout: (req, res) => {
        req.session.adEmail = null;
        res.redirect('/admin');
    },

    errorPage: (req, res) => {
        res.render('admin/error');
    },




    coupons: async (req, res) => {
        try {
            const couponData = await coupon.find();
            console.log(couponData);

            res.render('admin/coupon', { couponData, msg });
            msg = "";

        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },

    addCoupon: (req, res) => {
        try {
            console.log("inside addcoupon");
            const data = req.body;
            const couponname = data.couponName.toUpperCase();
            const dis = parseInt(data.discount);
            const maxLimit = parseInt(data.maxLimit);
            //   const minAmount = parseInt(data.minAmount);
            const discount = dis / 100;
            coupon.create({
                couponName: couponname,
                discount: discount,
                maxLimit: maxLimit,
                expirationTime: data.expirationTime,
            }).then((data) => {
                console.log(data);
                res.redirect("/admin/coupon");
            });
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },

    editCoupon: async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            coupon.updateOne(
                { _id: id },
                {
                    couponName: data.couponName,
                    discount: data.discount / 100,
                    maxLimit: data.maxLimit,
                    expirationTime: data.expirationTime
                }
            ).then(() => {
                res.redirect("/admin/coupon");
            }).catch((err) => {
                msg = "Invalid edit done"
                res.redirect('/admin/coupon')
            })
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },

    deleteCoupon: async (req, res) => {
        try {
            const id = req.params.id;
            await coupon.updateOne({ _id: id }, { $set: { delete: true } })
            res.redirect('/admin/coupon');
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },
    restoreCoupon: async (req, res) => {
        try {
            const id = req.params.id;
            await coupon.updateOne({ _id: id }, { $set: { delete: false } });
            res.redirect("/admin/coupon");
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },
    removeCoupon: async (req, res) => {
        try {
            const id = req.params.id;
            await coupon.deleteOne({ _id: id });
            res.redirect("/admin/coupon");
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },


    changeImage1: async (req, res) => {
        try {
            await products.updateOne({ _id: req.params.id },
                {
                    $set:
                    {
                        image1: req.file.filename
                    }
                })

            const directoryPath = "public/" + req.body.image1;
            fs.unlink(directoryPath, (err) => {
                try {
                    if (err) {
                        throw err;
                    }
                    console.log("Delete Image 1 succesfully");
                } catch (err) {
                    console.error(`error Deleting Image1:${err}`);
                }
            });
            res.redirect('/admin/products')

        } catch (err) {
            console.log(`Error change image1:${err}`);
            res.redirect('/admin/products');


        }

    },

    changeImage2: async (req, res) => {
        try {
            await products.updateOne({ _id: req.params.id },
                {
                    $set:
                    {
                        image2: req.file.filename
                    }
                })

            const directoryPath = "public/" + req.body.image2;
            fs.unlink(directoryPath, (err) => {
                try {
                    if (err) {
                        throw err;
                    }
                    console.log("Delete Image 2 succesfully");
                } catch (err) {
                    console.error(`error Deleting Image2:${err}`);
                }
            });
            res.redirect('/admin/products')

        } catch (err) {
            console.log(`Error change image2:${err}`);
            res.redirect('/admin/products');


        }

    },

    changeImage3: async (req, res) => {
        try {
            await products.updateOne({ _id: req.params.id },
                {
                    $set:
                    {
                        image3: req.file.filename
                    }
                })

            const directoryPath = "public/" + req.body.image3;
            fs.unlink(directoryPath, (err) => {
                try {
                    if (err) {
                        throw err;
                    }
                    console.log("Delete Image 3 succesfully");
                } catch (err) {
                    console.error(`error Deleting Image1:${err}`);
                }
            });
            res.redirect('/admin/products')

        } catch (err) {
            console.log(`Error change image3:${err}`);
            res.redirect('/admin/products');


        }

    },

    orderStatusChanging: async (req, res) => {
        try {
            const id = req.params.id;
            const data = req.body;
            await order.updateOne(
                { _id: id },
                {
                    $set: {
                        orderStatus: data.orderStatus,
                        paymentStatus: data.paymentStatus,
                    }
                }
            )
            res.redirect("/admin/orders");


        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },

    getOrderedProduct: async (req, res) => {
        try {
            const id = req.params.id;


            const objId = mongoose.Types.ObjectId(id)

            console.log(objId);
            const productData = await order.aggregate([
                {
                    $match: { _id: objId }
                },
                {
                    $unwind: "$orderItems"
                },
                {
                    $project: {
                        productItem: "$orderItems.productId",
                        productQuantity: "$orderItems.quantity",
                        productPrice: "$orderItems.productprice",
                        address: 1,
                        name: 1,
                        phoneNumber: 1
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productItem",
                        foreignField: "_id",
                        as: "productDetail"
                    }
                },
                {
                    $project: {
                        productItem: 1,
                        productQuantity: 1,
                        productPrice: 1,
                        address: 1,
                        name: 1,
                        phoneNumber: 1,
                        productDetail: { $arrayElemAt: ["$productDetail", 0] }
                    }
                },
                {
                    $lookup: {
                        from: "categorys",
                        localField: "productDetail.category",
                        foreignField: "_id",
                        as: "category_name"
                    }
                },
                {
                    $unwind: "$category_name"
                },

            ]).exec();

            console.log("orderproductData", productData);
            res.render('admin/orderedproduct', { productData })
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },

    deleteorder: async () => {

        console.log("delete order al")
        await order.deleteMany({});
    },



    getBannerPage: async (req, res) => {
        try {
            const bannerData = await banner.find().populate('couponName');
            const couponBanner = await coupon.find();
            res.render('admin/banner', { bannerData,couponBanner});
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },

    addBanner: async (req, res) => {
        try {
            await banner.create({
                offerType: req.body.offerType,
                bannerText: req.body.bannerText,
                couponName: req.body.couponName,
            }).then((data) => {
                res.redirect('/admin/getBanner')
            })
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }

    },
    editBanner: async (req, res) => {
        try {
            console.log("heyy inside banner")
            const id = req.params.id;
            const editedData = req.body;
            console.log(editedData)
            await banner.updateOne(
                { _id: id },
                {
                    offerType: editedData.offerType,
                    bannerText: editedData.bannerText,
                    couponName: editedData.couponName._id
                }
            ).then(() => {
                res.redirect('/admin/getBanner');
            })
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },

    deleteBanner: async (req, res) => {
        try {
            const id = req.params.id;
            await banner.updateOne(
                { _id: id },
                { isDeleted: true }
            ).then(() => {
                res.redirect('/admin/getBanner');
            })
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },
    restoreBanner: async (req, res) => {
        try {
            const id = req.params.id;
            await banner.updateOne(
                { _id: id },
                { isDeleted: false }
            ).then(() => {
                res.redirect('/admin/getBanner');
            })
        } catch {
            console.error()
            res.redirect("/admin/getBanner");
        }
    },
    removeBanner: async (req, res) => {
        try {
            const id = req.params.id;
            await banner.deleteOne({ _id:id});   
            res.redirect("/admin/getBanner"); 
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }    
    },

    salesReport: async (req, res) => {
        try {
            const allsalesReport = await order.find({
                paymentStatus: "paid",
                orderStatus: "delivered",
            });
            res.render("admin/salesReport", { allsalesReport });
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },
    dailyReport: async (req, res) => {
        try {
            const allsalesReport = await order.find({
                $and: [
                    { paymentStatus: "paid", orderStatus: "delivered" },
                    {
                        orderDate: moment().format("MMM Do YY")
                    }
                ]
            })
            res.render("admin/salesReport", { allsalesReport });
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    },
    monthlyReport: async (req, res) => {
        try {
            var d = new Date();
            d.setMonth(d.getMonth() - 1);
            const allsalesReport = await order.find({
                $and: [
                    { paymentStatus: "paid", orderStatus: "delivered" },
                    { created: { $gte: d } }
                ],
            })
            res.render('admin/salesReport', { allsalesReport });
        } catch (err) {
            console.log(err.message);
            res.redirect('/admin/error');
        }
    }









}

