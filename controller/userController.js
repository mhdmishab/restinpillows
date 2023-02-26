//
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



const { generate } = require('otp-generator');

function checkCoupon(data, id) {

    return new Promise((resolve) => {
        if (data) {
            coupon
                .find(
                    { couponName: data },
                    { users: { $elemMatch: { userId: id } } }
                )
                .then((exist) => {

                    console.log(exist);
                    if (exist[0].users.length) {
                        resolve(true);

                    } else {
                        coupon.find({ couponName: data }).then((discount) => {
                            resolve(discount);
                        });
                    }
                });
        } else {
            resolve(false);
        }
    });
}

var bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');

db.dbConnect();
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}
let msg = "";





module.exports = {
    home: async (req, res) => {
        let session = req.session.email;
        let products = await myProduct.find({}).populate("category").limit(6);


        res.render('users/home', { session, products });


    },
    userLogin: (req, res) => {
        if (req.session.email) {
            res.redirect('userprofile');
        } else {

            res.render('users/login', { msg });
            msg = "";

        }
    },
    doLogin: async (req, res) => {
        let userData = {};
        userData = req.body;
        try {
            return new Promise(async (resolve, reject) => {
                let response = {};
                let user = await myDb.users.findOne({ email: userData.email });
                if (user) {

                    console.log(user.password)
                    console.log(userData.password);
                    console.log(user.unblockuser)
                    bcrypt.compare(userData.password, user.password).then((status) => {
                        if (user.unblockuser == true) {


                            console.log(status);
                            if (status) {
                                console.log(`login successfull ${userData.email}`)
                                response.user = user;
                                response.status = true;
                                resolve(response);
                            } else {
                                res.redirect('/userlogin');
                                msg = "login verfication failed at doLogin";
                                console.log('login verfication failed at doLogin');


                            }
                        } else {
                            console.log("blocked user");
                            res.redirect('/userlogin');
                            msg = "Blocked User";
                        }
                    }).catch((err) => {
                        res.redirect('/userlogin');
                        msg = "password not correct";

                        console.log("password not correct");
                    })
                } else {

                    res.redirect('/userlogin');
                    msg = "user not exist";

                }



            }).then((response) => {
                if (response.status) {
                    req.session.email = response.user.email;
                    res.redirect('/');
                } else {
                    res.redirect('/userlogin');
                    msg = "invalid username";

                }
            })
        } catch (err) {
            res.redirect('/error');
        }



    },
    userSignup: (req, res) => {
        if (req.session.email) {
            res.redirect('/userprofile');
        } else {
            res.render('users/signup', { msg });
            msg = "";
        }
    },
    register: async (req, res) => {
        console.log(req.body);
        try {


            const myUser = req.body;

            let user = await myDb.users.findOne({ email: req.body.email });
            if (user) {
                res.redirect('/signup');
                msg = "User Exist";
            } else {
                authen.otp(req.body.email);
                let passwords = await bcrypt.hash(myUser.password, 10);
                res.redirect(`/otp?fulName=${myUser.fullname}&email=${myUser.email}&password=${passwords}`);
            }



        } catch (err) {
            res.redirect('/error');
        }
    },
    otpValidation: async (req, res) => {
        try {
            var myDetails = new myDb.users({
                fullname: req.body.fulname,
                email: req.body.email,
                password: req.body.password,
                unblockuser: true
            });
            console.log(myDetails);
            const otp = req.body.emailOtp;
            console.log(typeof (otp));
            console.log(otp);
            newOtp.findOne({ otp: otp }, (err, otpDetails) => {
                if (err) {
                    console.log(otpDetails);
                    console.log("ERROE1");

                } else {
                    if (otpDetails) {
                        if (otpDetails.expiration > Date.now()) {
                            console.log('OTP validated successfully');

                            myDetails.save().then(item => {
                                req.session.email = myDetails.email;
                                res.redirect('/userprofile')
                            })
                                .catch(err => {
                                    console.log("unable to save to database");
                                    res.redirect('/signup');
                                });

                        } else {
                            console.log("OTP expired");
                            res.redirect('/signup');

                        }
                    } else {
                        console.log('Invalid OTP');
                        res.render('users/login', { msg: "invalid otp" })

                    }
                }
            })
            newOtp.deleteMany({}, (err) => {
                if (err) {
                    console.log('error');
                    console.log(err);
                }
            });
        } catch (err) {
            console.log("big error");
            res.redirect('/error');
        }


    },

    otpIndex: (req, res) => {
        const userInfo = req.query;
        console.log(userInfo);
        res.render('users/otp', { userInfo });
    },


    userLogout: (req, res) => {
        req.session.email = null;
        res.redirect('/');
    },

    errorPage: (req, res) => {
        res.render('users/error');
    },

    forgotPassword: (req, res) => {
        res.render('users/forgetpass');
    },

    forgotPass: async (req, res) => {
        console.log(req.body);
        let user = await myDb.users.findOne({ email: req.body.email });
        if (user) {
            authen.otp(req.body.email);
            let passwords = await bcrypt.hash(req.body.newpassword, 10);
            res.redirect(`/otpforgot?email=${req.body.email}&newpassword=${passwords}`);
        } else {
            console, log('invalid email');
            res.redirect('/error');
        }
    },

    otpForgot: (req, res) => {
        const userInfo = req.query;
        console.log(userInfo);
        res.render('users/otpforgot', { userInfo });

    },

    otpForgotpost: async (req, res) => {
        try {
            await myDb.users.updateOne({ email: req.body.email }, { $set: ({ password: req.body.newpassword }) });
            var myDetails = await myDb.users.findOne({ email: req.body.email });
            console.log(myDetails);
            const otp = req.body.emailOtp;
            console.log(typeof (otp));
            console.log(otp);
            newOtp.findOne({ otp: otp }, (err, otpDetails) => {
                if (err) {
                    console.log(otpDetails);
                    console.log("ERROE1");

                } else {
                    if (otpDetails) {
                        if (otpDetails.expiration > Date.now()) {
                            console.log('OTP validated successfully');

                            myDetails.save().then(item => {
                                req.session.email = myDetails.email;
                                res.redirect('/profile')
                            })
                                .catch(err => {
                                    console.log("unable to save to database");
                                    res.redirect('/signup');
                                });

                        } else {
                            console.log("OTP expired");
                            res.redirect('/signup');

                        }
                    } else {
                        console.log('Invalid OTP');
                        res.render('users/login', { msg: "invalid otp" })

                    }
                }
            })
            newOtp.deleteMany({}, (err) => {
                if (err) {
                    console.log('error');
                    console.log(err);
                }
            });

        } catch (err) {
            console.log("big error");
            res.redirect('/error');
        }
    },


    addCart: async (req, res) => {
        console.log("inside add cart controlleer");
        try {
            const id = req.body.productId;
            console.log(id);

            const session = req.session.email;

            let proObj = {
                productId: id,
                quantity: 1,
            };

            console.log(proObj);
            const userData = await myDb.users.findOne({ email: session });

            console.log(userData);

            const userCart = await cart.findOne({ userId: userData._id });
            console.log(userCart);
            if (userCart) {
                let proExist = userCart.product.findIndex(
                    (product) => product.productId == id
                );
                console.log(proExist);
                if (proExist != -1) {
                    await cart.aggregate([
                        {
                            $unwind: "$product",
                        },
                    ]);
                    await cart.updateOne(
                        {
                            userId: userData._id,
                            "product.productId": id
                        },
                        { $inc: { "product.$.quantity": 1 } }
                    );
                    console.log("first");
                    res.json({ success: true });
                    // res.redirect('/viewcart')
                } else {
                    cart
                        .updateOne({ userId: userData._id }, { $push: { product: proObj } })
                        .then(() => {
                            // res.redirect("/viewcart");
                            res.json({ success: true });
                        });
                }
            } else {
                const newCart = new cart({
                    userId: userData.id,
                    product: [
                        {
                            productId: id,
                            quantity: 1,
                        },
                    ],
                });
                newCart.save().then(() => {
                    // res.redirect("/viewcart");
                    res.json({ success: true });
                });
            }
        } catch (err) {
            // res.redirect('/error')
        }
    },

    viewCart: async (req, res) => {
        console.log("helooooooooooooo");
        const session = req.session.email;
        console.log(session)
        const userData = await myDb.users.findOne({ email: session });

        const productData = await cart
            .aggregate([
                {
                    $match: { userId: userData.id },
                },
                {
                    $unwind: "$product",
                },

                {
                    $project: {
                        productItem: "$product.productId",
                        productQuantity: "$product.quantity",
                    },
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productItem",
                        foreignField: "_id",
                        as: "productDetail",
                    },
                },
                {
                    $project: {
                        productItem: 1,
                        productQuantity: 1,
                        productDetail: { $arrayElemAt: ["$productDetail", 0] },
                    },
                },
                {
                    $addFields: {
                        productPrice: {
                            $multiply: ["$productQuantity", "$productDetail.price"],
                        },
                    }
                },
            ])
            .exec();
        console.log(productData);
        const sum = productData.reduce((accumulator, object) => {
            return accumulator + object.productPrice;
        }, 0);
        let countCart = productData.length;


        // let id = req.params.id;
        // let product = await myProduct.findOne({ _id: id });
        res.render("users/cart", {
            session,
            productData,

            sum, countCart,
            // product:product,
            // countlnWishlist,

        });

    },

    userProfile: async (req, res) => {
        const session = req.session.email;
        let userData = await myDb.users.findOne({ email: session })
        let userProfile = await profile.findOne({ email: session });
        if (userProfile) {
            res.render('users/profile', { session, userData, userProfile })
        } else {
            res.render('users/profile', { session, userData, userProfile });
        }


    },

    changeProfilePass: async (req, res) => {
        try {
            const session = req.session.email;
            const oldPassword = req.body.oldpassword;
            const newPassword = await bcrypt.hash(req.body.newpassword, 10);
            let userData = await myDb.users.findOne({ email: session });
            let userProfile = await profile.findOne({ email: session });

            bcrypt.compare(userData.password, oldPassword).then(async (status) => {

                if (status) {
                    await myDb.users.updateOne({ email: session }, { $set: { password: newPassword } });
                    let msg = "password changed successfully";
                    res.render('users/profile', { session, userData, userProfile, msg })

                    msg = "";
                } else {
                    let msg = "password change failed,Invalid old password";
                    res.render('users/profile', { session, userData, userProfile, msg })
                    msg = "";
                }

            })

        } catch (err) {
            console.error('change password error');
            res.redirect('/error')
        }










    },

    editProfile: async (req, res) => {
        const session = req.session.email;
        let userData = await myDb.users.findOne({ email: session })
        let userProfile = await profile.findOne({ email: session });

        if (userProfile) {
            res.render('users/editprofile', { session, userData, userProfile });
        } else {

            res.render('users/editprofile', { session, userData, userProfile });
        }

    },

    postEditProfile: async (req, res) => {
        const session = req.session.email;
        let userProfile = await profile.findOne({ email: session });
        if (userProfile) {
            console.log("iam inside profile");
            await profile.updateOne(
                { email: session },
                {
                    $set: {
                        fullname: req.body.fullname,
                        phone: req.body.phone,
                        addressDetails: [
                            {
                                housename: req.body.housename,
                                area: req.body.area,
                                landmark: req.body.landmark,
                                district: req.body.district,
                                state: req.body.state,
                                postoffice: req.body.postoffice,
                                pin: req.body.pin
                            }
                        ]

                    }
                }
            );
            await myDb.users.updateOne(
                { email: session },
                {
                    $set: {
                        fullname: req.body.fullname,
                        email: req.body.email,


                    }
                }
            )
        } else {
            console.log("iam new profile");
            const nwprofile = new profile({



                fullname: req.body.fullname,
                email: req.body.email,
                phone: req.body.phone,
                addressDetails: [
                    {
                        housename: req.body.housename,
                        area: req.body.area,
                        landmark: req.body.landmark,
                        district: req.body.district,
                        state: req.body.state,
                        postoffice: req.body.postoffice,
                        pin: req.body.pin
                    }
                ]



            });
            nwprofile.save();


            console.log("iam here");
            await myDb.users.updateOne(
                { email: session },
                {
                    $set: {
                        fullname: req.body.fullname,
                        email: req.body.email,


                    }
                }
            )

        }
        res.redirect('/profile')
    },

    changeQuantity: async (req, res) => {
        let session = req.session.email;
        const userData = await myDb.users.find({ email: session });

        console.log(111);
        const data = req.body;
        console.log(data);
        const objId = data.product;
        let zeroQuantity = false;
        const cartData = await cart.find({ _id: data.cart });

        let newdata;





        cart.updateOne(
            { _id: data.cart, "product.productId": objId },
            { $inc: { "product.$.quantity": data.count } }
        ).then(async () => {
            newdata = await cart.findOne({ _id: data.cart }, { product: { $elemMatch: { productId: objId } } });
            if (newdata == null) {
                console.log("newdata is here" + newdata);
                res.redirect('/home');
            }
            if (newdata.product[0].quantity == 0 || newdata.product[0].quantity < 0) {
                await cart
                    .updateOne(
                        { _id: data.cart, "product.productId": objId },
                        { $pull: { product: { productId: objId } } }
                    )
                zeroQuantity = true;
            }
            const userid = userData[0]._id;
            const cartuserid = mongoose.Types.ObjectId(cartData[0].userId);
            console.log(cartuserid)
            console.log(userid)
            let productData = await cart.aggregate([
                {
                    $match: { userId: cartData[0].userId },
                },
                {
                    $unwind: "$product",
                },
                {
                    $project: {
                        productItem: "$product.productId",
                        productQuantity: "$product.quantity",
                    },
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productItem",
                        foreignField: "_id",
                        as: "productDetail",
                    },
                },
                {
                    $project: {
                        productItem: 1,
                        productQuantity: 1,
                        productDetail: { $arrayElemAt: ["$productDetail", 0] },
                    },
                },
                {
                    $addFields: {
                        productPrice: {
                            $multiply: ["$productQuantity", "$productDetail.price"],
                        },
                    },
                },
            ]);

            console.log("productData", productData);
            const sum = productData.reduce((accumulator, object) => {
                return accumulator + object.productPrice;
            }, 0);
            console.log("helooo sum", sum)
            res.status(200).send({ data: "this is data", newdata, zeroQuantity, sum });


        });





    },

    deleteCartProd: async (req, res) => {

        const cartid = req.body.cartId;
        const cartId = mongoose.Types.ObjectId(cartid);
        const productid = req.body.productId;
        console.log(cartId);
        console.log(productid);

        await cart.aggregate([
            {
                $unwind: "$product",
            }
        ]);
        await cart
            .updateOne(
                { _id: cartid, "product.productId": productid },
                { $pull: { product: { productId: productid } } }
            )
            .then(() => {
                res.json({ status: true });
                // res.redirect('/viewcart');

            });






    },

    checkOut: async (req, res) => {
        let session = req.session.email;
        const userdata = await myDb.users.findOne({ email: session });
        const userData = await profile.findOne({ email: session });
        const userId = userdata._id.toString()
        console.log(userId);
        // const productData=await cart.findOne({userId: userId});
        // console.log(productData);
        const productData = await cart
            .aggregate([
                {
                    $match: { userId: userId },
                },
                {
                    $unwind: "$product",
                },
                {
                    $project: {
                        productItem: "$product.productId",
                        productQuantity: "$product.quantity",
                    },
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productItem",
                        foreignField: "_id",
                        as: "productDetail",
                    },
                },
                {
                    $project: {
                        productItem: 1,
                        productQuantity: 1,
                        productDetail: { $arrayElemAt: ["$productDetail", 0] },
                    },
                },
                {
                    $addFields: {
                        productPrice: {
                            $multiply: ["$productQuantity", "$productDetail.price"]
                        }
                    }
                }
            ])
            .exec();
        const sum = productData.reduce((accumulator, object) => {
            return accumulator + object.productPrice;
        }, 0);

        console.log(sum);

        const query = req.query
        console.log(query);
        // await order.deleteOne({_id:query.orderId})
        res.render("users/checkout", { session, productData, userData, sum });


    },

    postEditAddress: async (req, res) => {
        const session = req.session.email;
        let userProfile = await profile.findOne({ email: session });
        if (userProfile) {
            await profile.updateOne(
                { email: session },
                {
                    $set: {

                        addressDetails: [
                            {
                                housename: req.body.housename,
                                area: req.body.area,
                                landmark: req.body.landmark,
                                district: req.body.district,
                                state: req.body.state,
                                postoffice: req.body.postoffice,
                                pin: req.body.pin
                            }
                        ]

                    }
                }
            );

        } else {
            const nwprofile = new profile({

                addressDetails: [
                    {
                        housename: req.body.housename,
                        area: req.body.area,
                        landmark: req.body.landmark,
                        district: req.body.district,
                        state: req.body.state,
                        postoffice: req.body.postoffice,
                        pin: req.body.pin
                    }
                ]



            });

            nwprofile.save();
        }
        res.redirect('/checkout')

    },

    addNewAddress: async (req, res) => {
        const session = req.session.email;
        console.log("hellooooo" + session);
        const addObj = {
            housename: req.body.housename,
            area: req.body.area,
            landmark: req.body.landmark,
            district: req.body.district,
            state: req.body.state,
            postoffice: req.body.postoffice,
            pin: req.body.pin
        }
        console.log("hellooooo" + addObj);
        await profile.updateOne({ email: session }, { $push: { addressDetails: addObj } });
        res.redirect('/checkout')
    },

    getShop: async (req, res) => {
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

    },

    getSubcategory: async (req, res) => {

        const categoryID = req.body.category;
        const categoryId = mongoose.Types.ObjectId(categoryID);
        console.log(categoryId);
        const subcategories = await mySubcategory.find({ categoryid: categoryId });
        console.log(subcategories);
        res.json(subcategories);
    },

    // shop

    sortProducts: async (req, res) => {

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





    },

    filterProducts: async (req, res) => {
        let session = req.session.email;

        try {
            console.log("hey filter")
            let products = await myProduct.find({ unlist: false, category: req.body.categoryId }).populate('category');

            console.log("heyy", products);

            res.status(200).send({ products, session });



        } catch (err) {
            res.redirect('/error');
        }



    },

    doSearch: async (req, res) => {
        let session = req.session.email;
        console.log(req.body.searchtext);
        const category = await myCategory.find({});
        let product = await myProduct.find({ productname: new RegExp(req.body.searchtext) });
        console.log(product);

        if (product) {
            res.render('users/shop', { session, product, category });
        }
    },

    placeOrder: async (req, res) => {
        console.log("Inside place order")


        const data = req.body;
        console.log(data);

        const session = req.session.email;
        const userData = await myDb.users.findOne({ email: session });
        const userProfileData = await profile.findOne({ email: session });
        const cartData = await cart.findOne({ userId: userData._id });
        const objId = mongoose.Types.ObjectId(userData._id)

        const orderData = new order({
            userId: userData._id,
            name: userProfileData.fullname,
            phoneNumber: userProfileData.phone,
            address: req.body.address,
            orderItems: cartData.product,
            totalAmount: parseInt(req.body.totalAmountPaid),
            paymentMethod: req.body.payment,
            orderDate: moment().format("MMM Do YY"),
            deliveryDate: moment().add(3, "days").format("MMM Do YY")
        });



        if (req.body.payment === "COD") {
            const orderDatas = await orderData.save()

            console.log("Order data Saved");
            const orderId = orderDatas._id

            await order.updateOne({ _id: orderId }, { $set: { orderStatus: 'placed' } })
            await cart.deleteOne({ userId: userData._id });
            let session = req.session.email;

            if (data.coupon && data.coupon != '') {
                await coupon.updateOne({ couponName: data.coupon }, { $push: { users: { userId: objId } } });
            }

            res.json({ success: true })

        } else {
            console.log("HERE IN ONLINE PAYMENT");
            const orderDatas = await orderData.save();
            const orderId = orderDatas._id;
            console.log(orderDatas);

            let options = {
                amount: orderDatas.totalAmount,
                currency: "INR",
                receipt: "" + orderId,
            };
            instance.orders.create(options, function (err, orderDatas) {

                if (err) {
                    console.log(err);
                } else {
                    res.json(orderDatas);
                }
            });



        }

        // } else {

        //   res.redirect("users/viewCart");
        // }
        // }
        // }
    },


    // placeOrder: async (req, res) => {
    //     console.log("Inside place order")


    //     // let invalid;
    //     // let couponDeleted;
    //     const data = req.body;
    //     console.log(data);

    //     const session = req.session.email;
    //     const userData = await myDb.users.findOne({ email: session });
    //     const userProfileData = await profile.findOne({ email: session });
    //     const cartData = await cart.findOne({ userId: userData._id });
    //     const objId = mongoose.Types.ObjectId(userData._id)

    //                 const orderData = new order({
    //                     userId: userData._id,
    //                     name: userProfileData.fullname,
    //                     phoneNumber: userProfileData.phone,
    //                     address: req.body.address,
    //                     orderItems: cartData.product,
    //                     totalAmount:parseInt(req.body.totalAmountPaid),
    //                     paymentMethod: req.body.payment,
    //                     orderDate: moment().format("MMM Do YY"),
    //                     deliveryDate: moment().add(3, "days").format("MMM Do YY")
    //                 });



    //                 if (req.body.payment === "COD") {
    //                     const orderDatas = await orderData.save()

    //                     console.log("Order data Saved");
    //                     const orderId = orderDatas._id

    //                     await order.updateOne({ _id: orderId }, { $set: { orderStatus: 'placed' } })
    //                     await cart.deleteOne({ userId: userData._id });
    //                     let session = req.session.email;

    //                         if(data.coupon&&data.coupon!=''){
    //                         await coupon.updateOne( {couponName:data.coupon}, {$push:{users: {userId : objId}}});
    //                         }

    //                       res.json({ success: true})

    //                 } else {
    //                     console.log("HERE IN ONLINE PAYMENT");
    //                     const orderDatas = await orderData.save();
    //                     const orderId = orderDatas._id;
    //                     console.log(orderDatas);

    //                     let options = {
    //                         amount: orderDatas.totalAmount * 100, // multiply by 100 to convert to paisa (Razorpay's currency unit)
    //                         currency: "INR",
    //                         receipt: "" + orderId,
    //                     };
    //                     instance.orders.create(options, function (err, order) {
    //                         if (err) {
    //                         console.log(err);
    //                         res.status(500).json({ success: false, message: "Error creating Razorpay order" });
    //                         } else {
    //                         console.log(order);
    //                         razorPay(order);
    //                         // The Razorpay order ID and signature will not be available here
    //                         // as they need to be generated by Razorpay and passed to the client-side JavaScript code
    //                         // You can send the order ID to the client-side JavaScript code as a response to the API call
    //                         res.json({ success: true, orderId: order.id });
    //                         }
    //                     });
    //                     }
    //             // } else {

    //                 //   res.redirect("users/viewCart");
    //             // }
    //         // }
    //     // }
    // },




    orderSuccess: async (req, res) => {
        let session = req.session.email;
        const query = req.query
        const orderId = query.orderId
        await order.updateOne({ _id: orderId }, { $set: { orderStatus: 'placed', paymentStatus: 'paid' } })
        await cart.deleteOne({ userId: query.cartId });

        res.render('users/ordersuccess', { session })
    },

    verifyPayment: async (req, res, next) => {
        try {
            console.log("helloo");
            const details = req.body;

            console.log(details);
            let hmac = crypto.createHmac("SHA256", process.env.KETSECRET);
            console.log(hmac);
            hmac.update(details.payment.razorpay_order_id + "|" + details.payment.razorpay_payment_id);
            hmac = hmac.digest("hex");

            console.log(hmac);
            console.log(details.payment.razorpay_signature);
            console.log(details.payment.razorpay_signature);

            if (hmac == details.payment.razorpay_signature) {
                const objId = mongoose.Types.ObjectId(details.order.receipt);
                order.updateOne({ _id: objId }, { $set: { paymentStatus: "paid", orderStatus: 'placed' } }).then(() => {

                    res.json({ success: true });

                }).catch((err) => {
                    console.log("catch error")
                    console.log(err);
                    res.json({ status: false, err_message: "payment failed" });
                })

            } else {
                console.log("else error")
                console.log(err);

                res.json({ status: false, err_message: "payment failed" });
            }


        } catch (err) {
            next(err)
        }
    },

    applyCoupon: async (req, res) => {
        console.log("inside APPLYCOUPON");
        let invalid;
        let couponDeleted;
        const data = req.body.couponcode;
        console.log(data);

        const session = req.session.email;
        const userData = await myDb.users.findOne({ email: session });
        const userProfileData = await profile.findOne({ email: session });
        const cartData = await cart.findOne({ userId: userData._id });
        const objId = mongoose.Types.ObjectId(userData._id)

        if (data) {
            invalid = await coupon.findOne({ couponName: data });
            console.log(invalid);
            if (invalid?.delete == true) {
                couponDeleted = true
            }
        } else {
            invalid = 0;
        }

        if (invalid == null) {
            res.json({ invalid: true });
        } else if (couponDeleted) {
            res.json({ couponDeleted: true })
        } else {
            const discount = await checkCoupon(data, objId);
            console.log(discount);
            if (discount == true) {
                res.json({ coupon: true })
            } else {

                if (cartData) {
                    const productData = await cart
                        .aggregate([
                            {
                                $match: { userId: userData.id },
                            },
                            {
                                $unwind: "$product",
                            },
                            {
                                $project: {
                                    productItem: "$product.productId",
                                    productQuantity: "$product.quantity",

                                },
                            },
                            {
                                $lookup: {
                                    from: "products",
                                    localField: "productItem",
                                    foreignField: "_id",
                                    as: "productDetail",
                                },
                            },
                            {
                                $project: {
                                    productItem: 1,
                                    productQuantity: 1,
                                    productSize: 1,
                                    productDetail: { $arrayElemAt: ["$productDetail", 0] },
                                },
                            },
                            {
                                $addFields: {
                                    productPrice: {
                                        $multiply: ["$productQuantity", "$productDetail.price"]
                                    }
                                }
                            }
                        ])
                        .exec();
                    const sum = productData.reduce((accumulator, object) => {
                        return accumulator + object.productPrice;
                    }, 0);

                    var total = sum;
                    if (discount == false) {
                        var total = sum;
                    } else {
                        var dis = sum * discount[0].discount;
                        if (dis > discount[0].maxLimit) {
                            total = sum - discount[0].maxLimit;

                        } else {
                            total = sum - dis;
                        }
                    }

                    console.log(total)

                    res.json({ total });

                }

            }

        }

    },

    productDetail: async (req, res) => {
        let session = req.session.email;
        const productId = req.params.id;
        console.log(productId);

        const product = await myProduct.find({ _id: productId });
        console.log(product)


        res.render('users/productDetail', { session, product })

    },

    orderDetails: async (req, res) => {
        const session = req.session.email;
        const userData = await myDb.users.findOne({ email: session });
        const userId = userData._id
        const objId = mongoose.Types.ObjectId(userId);
        console.log(objId);
        const productData = await order
            .aggregate([
                {
                    $match: { userId: objId },
                },
                {
                    $unwind: "$orderItems",
                },
                {
                    $project: {
                        productItem: "$orderItems.productId",
                        productQuantity: "$orderItems.quantity",
                        address: 1,
                        name: 1,
                        phonenumber: 1,
                        totalAmount: 1,
                        orderStatus: 1,
                        paymentMethod: 1,
                        paymentStatus: 1,
                        orderDate: 1,
                        deliveryDate: 1,
                        createdAt: 1,
                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "productItem",
                        foreignField: "_id",
                        as: "productDetail",
                    }
                },
                {
                    $project: {
                        productItem: 1,
                        productQuantity: 1,
                        name: 1,
                        phoneNumber: 1,
                        address: 1,
                        totalAmount: 1,
                        orderStatus: 1,
                        paymentMethod: 1,
                        paymentStatus: 1,
                        orderDate: 1,
                        deliveryDate: 1,
                        createdAt: 1,
                        productDetail: { $arrayElemAt: ["$productDetail", 0] },
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

            ]).sort({ createdAt: -1 });
        const orderDetails = await order.find({ userId: userData._id }).sort({ createdAt: -1 });
        console.log(productData.length)
        res.render('users/orderdetails', { session,productData, orderDetails});
    },

    orderedProduct: async (req, res) => {
        const id = req.params.id;
        const session = req.session.email; 
        const userData = await myDb.users.findOne({ email: session });
        const orderDetails = await order.find({ userId: userData._id }).sort({ createdAt: -1 })
        const objId = mongoose.Types.ObjectId(id);
        const productData = await order
          .aggregate([
            {
              $match: { _id: objId },
            },
            {
              $unwind: "$orderItems",
            },
            {
              $project: {
                productItem: "$orderItems.productId",
                productQuantity: "$orderItems.quantity",
                productSize:"$orderItems.size",
                address: 1,
                name: 1,
                phonenumber: 1
              }
            },
            {
              $lookup: {
                from: "products",
                localField: "productItem",
                foreignField: "_id",
                as: "productDetail",
              }
            },
            {
              $project: {
                productItem: 1,
                productQuantity: 1,
                name: 1,
                phoneNumber: 1,
                address: 1,
                productDetail: { $arrayElemAt: ["$productDetail", 0] },
              }
            },
            {
              $lookup: {
                from: 'categorys',
                localField: 'productDetail.category',
                foreignField: "_id",
                as: "category_name"
              }
            },
            {
              $unwind: "$category_name"
            } 
    
          ]);
       
        console.log("Order details",orderDetails);
        console.log("Order details",productData);
        
        res.render('users/orderedProduct', { session,productData, orderDetails});
      },
      cancelOrder: async (req, res) => {
        const data = req.params.id;
        await order.updateOne({ _id: data }, { $set: { orderStatus: "cancelled" } })
        res.redirect("/orderDetails");
    
      }











}
























