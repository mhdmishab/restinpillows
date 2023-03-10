//
const { render } = require('ejs');
const db = require('../config/connection');
var bcrypt = require('bcrypt');
const { default: mongoose } = require('mongoose');
const { findOne } = require('../model/usermodel');
const myDb = require('../model/usermodel');
const cart = require('../model/cartmodel');
const order = require('../model/ordermodel');
const myProduct = require('../model/productmodel');
const myCategory = require('../model/categorymodel');
// const mySubcategory = require('../model/subcategory');
const coupon = require('../model/couponmodel');
const banner = require('../model/bannermodal');
const auth = require('../utils/auth');
const newOtp = require('../model/otpmodel');
const nodemailer = require('nodemailer');
const authen = require('../utils/auth');
const profile = require('../model/profile');
const moment = require('moment');
const dotenv = require("dotenv");

const { setFlagsFromString } = require('v8');
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



db.dbConnect();
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}
let msg;





module.exports = {

    home: async (req, res) => {
        console.log("homee");
        try {
            let session = req.session.email;
            let products = await myProduct.find({ unlist: false }).populate("category").limit(8);
            let bannerData = await banner.find({ isDeleted: false }).populate("couponName").sort({ createdAt: -1 }).limit(1);
           
            console.log(bannerData);


            res.render('users/home', { session, products, bannerData });
        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },

    userLogin: (req, res) => {
        try {
            if (req.session.email) {
                res.redirect('userprofile');
            } else {

                res.render('users/login', { msg });
                msg = "";

            }
        } catch (err) {
            res.redirect('/error');
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
                                msg = "Incorrect Password";
                                console.log('login verfication failed at doLogin');


                            }
                        } else {
                            console.log("blocked user");
                            res.redirect('/userlogin');
                            msg = "Blocked User";
                        }
                    }).catch((err) => {
                        res.redirect('/userlogin');
                        msg = "Incorrect Password";

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
        try {
            if (req.session.email) {
                res.redirect('/userprofile');
            } else {
                res.render('users/signup', { msg });
                msg = "";
            }
        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

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
                                res.redirect('/');
                            })
                                .catch(err => {
                                    console.error(err.message);
                                    console.log("unable to save to database");
                                    res.redirect('/signup');
                                });

                        } else {
                            console.log("OTP expired");
                            msg = "OTP Expired"
                            res.redirect('/signup');

                        }
                    } else {
                        console.log('Invalid OTP');
                        msg = "Invalid OTP";
                        res.redirect('/signup')


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
            console.log(err.message);
            res.redirect('/error');
        }


    },

    otpIndex: (req, res) => {
        try {
            const userInfo = req.query;
            console.log(userInfo);
            res.render('users/otp', { userInfo });
        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },


    userLogout: (req, res) => {
        try {
            req.session.email = null;
            res.redirect('/');
        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },

    errorPage: (req, res) => {
        res.render('users/error');
    },

    forgotPassword: (req, res) => {
        try {
            res.render('users/forgetpass', { msg });
            msg = "";
        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }



    },

    forgotPass: async (req, res) => {
        console.log(req.body);
        try {
            let user = await myDb.users.findOne({ email: req.body.email });
            if (user) {
                authen.otp(req.body.email);
                let passwords = await bcrypt.hash(req.body.newpassword, 10);
                res.redirect(`/otpforgot?email=${req.body.email}&newpassword=${passwords}`);
            } else {
                console.log('invalid email');
                msg = "Invalid mail";
                res.redirect('/forgotpassword');
            }
        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },

    otpForgot: (req, res) => {
        try {
            const userInfo = req.query;
            console.log(userInfo);
            res.render('users/otpforgot', { userInfo });

        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },


    otpForgotpost: async (req, res) => {
        try {

            var myDetails = await myDb.users.findOne({ email: req.body.email });
            console.log(myDetails);
            const otp = req.body.emailOtp;
            console.log(typeof (otp));
            console.log(otp);
            newOtp.findOne({ otp: otp }, async (err, otpDetails) => {
                if (err) {
                    console.log(otpDetails);
                    console.log("ERROE1");

                } else {
                    if (otpDetails) {
                        if (otpDetails.expiration > Date.now()) {
                            console.log('OTP validated successfully');
                            await myDb.users.updateOne({ email: req.body.email }, { $set: ({ password: req.body.newpassword }) });

                            myDetails.save().then(item => {
                                req.session.email = myDetails.email;
                                res.redirect('/')
                            })
                                .catch(err => {
                                    console.log("unable to save to database");
                                    res.redirect('/signup');
                                });

                        } else {
                            console.log("OTP expired");
                            res.render('users/login', { msg: "OTP expired" })
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

            console.log(err.message);
            res.redirect('/error');

        }
    },


    addCart: async (req, res) => {
        console.log("inside add cart controlleer");
        try {
            const id = req.body.productId;
            const product = await myProduct.findOne({ _id: id });
            console.log(id);

            const session = req.session.email;

            let proObj = {
                productId: id,
                quantity: 1,
                productprice: product.price,
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

                } else {
                    cart
                        .updateOne({ userId: userData._id }, { $push: { product: proObj } })
                        .then(() => {

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
                            productprice: product.price
                        },
                    ],
                });
                newCart.save().then(() => {

                    res.json({ success: true });
                });
            }
        } catch (err) {
            res.redirect('/error')
        }
    },

    viewCart: async (req, res) => {
        console.log("helooooooooooooo");
        const session = req.session.email;
        console.log(session)
        try {
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

        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },

    userProfile: async (req, res) => {
        try {
            const session = req.session.email;
            let userData = await myDb.users.findOne({ email: session })
            let userProfile = await profile.findOne({ email: session });

            res.render('users/profile', { session, userData, userProfile, msg });
            msg = "";



        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },

    changeProfilePass: async (req, res) => {
        try {
            const session = req.session.email;
            const oldPassword = req.body.oldpassword;
            const newPassword = await bcrypt.hash(req.body.newpassword, 10);
            let userData = await myDb.users.findOne({ email: session });
            let userProfile = await profile.findOne({ email: session });

            bcrypt.compare(oldPassword, userData.password).then(async (status) => {

                if (status) {
                    await myDb.users.updateOne({ email: session }, { $set: { password: newPassword } });
                    let msg = "password changed successfully";
                    res.render('users/profile', { session, userData, userProfile, msg })

                    msg = "";
                } else {
                    msg = "Invalid old password";
                    res.redirect('/profile')
                    msg = ""

                }

            })

        } catch (err) {
            console.error('change password error');
            res.redirect('/error')
        }
    },

    editProfile: async (req, res) => {
        const session = req.session.email;
        try {
            let userData = await myDb.users.findOne({ email: session })
            let userProfile = await profile.findOne({ email: session });

            if (userProfile) {
                res.render('users/editprofile', { session, userData, userProfile });
            } else {

                res.render('users/editprofile', { session, userData, userProfile });
            }

        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },

    postEditProfile: async (req, res) => {
        try {
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
                            'addressDetails.0': [
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
                    'addressDetails.0': [
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
        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },

    deleteAddress: async (req, res) => {
        try {
            console.log("inside delete Address");
            const session = req.session.email;
            const name = req.params.name;
            addressId = req.params.id;
            console.log(addressId);

            await profile.updateOne({
                email: session
            }, {
                $pull: {
                    addressDetails: {
                        _id: addressId
                    }
                }
            });

            if (name == "checkout") {
                res.redirect('/checkout');
            } else {
                res.redirect('/profile')
            }


        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },

    changeQuantity: async (req, res) => {
        try {
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
                console.log("helooo sum", sum);
                const countCart = await cart.aggregate([
                    { $match: { userId: cartData[0].userId } },
                    { $project: { count: { $size: "$product" } } }
                ]);
                res.status(200).send({ data: "this is data", newdata, zeroQuantity, sum, countCart });


            });

        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },

    deleteCartProd: async (req, res) => {
        try {

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
                .then(async () => {
                    const Cart = await cart.findOne({ _id: cartId });
                    const countCart = Cart.product.length;
                    res.json({ countCart });
                    // res.redirect('/viewcart');

                });






        } catch (err) {

            console.log(err.message);
            res.redirect('/error');

        }
    },

    checkOut: async (req, res) => {
    try{
        let session = req.session.email;
        let userProfile = await profile.findOne({ email: session });
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
        res.render("users/checkout", { session, productData, userData, sum, userProfile });


    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
    },

    postEditAddress: async (req, res) => {
    try{
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

    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
},

    editAddress: async (req, res) => {
    try{
        console.log("inside edit adress")

        const name = req.params.name;

        const session = req.session.email;
        const addressId = req.params.id;

        console.log(addressId);
        console.log(req.body.housename);
        console.log(req.body.area);
        console.log(req.body.landmark);
        console.log(req.body.district);
        console.log(req.body.state);
        console.log(req.body.pin);

        let userProfile = await profile.findOne({ email: session });
        if (userProfile) {
            await profile.updateOne(
                {
                    email: session,
                    addressDetails: {
                        $elemMatch: {
                            _id: addressId
                        }
                    }
                },
                {
                    $set: {
                        "addressDetails.$.housename": req.body.housename,
                        "addressDetails.$.area": req.body.area,
                        "addressDetails.$.landmark": req.body.landmark,
                        "addressDetails.$.district": req.body.district,
                        "addressDetails.$.state": req.body.state,
                        "addressDetails.$.postoffice": req.body.postoffice,
                        "addressDetails.$.pin": req.body.pin
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
        if (name == "checkout") {
            res.redirect('/checkout');
        } else {
            res.redirect('/profile')
        }


    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
},

    addNewAddress: async (req, res) => {
    try{
        const name = req.params.name;
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
        if (name == "checkout") {
            res.redirect('/checkout');
        } else {
            res.redirect('/profile')
        }

    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
},

    getShop: async (req, res) => {
        // const session = req.session.email;
        // const category = await myCategory.find({});
        // const product = await myProduct.find({ unlist: false }).populate('category');
        // let productCount = await myProduct.find({ unlist: false }).count();
        // res.render('users/shop', { session, product, category, productCount });
    try{


        const session = req.session.email;
        const category = await myCategory.find({isDeleted:false});
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

    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
},



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
        console.log("inside search")
        try {
            const session = req.session.email;
            if(req.body.searchtext!=""){
            console.log("seacrh text is here ", req.body.searchtext);
            const category = await myCategory.find({});
            let product = await myProduct.find({
                productname: { $regex: new RegExp(req.body.searchtext, 'i') }
            }).populate('category').catch((err) => {
                console.log("search error");
                res.redirect('/');
            })
            console.log(product);
            let results;
            res.render('users/shop', { session, product, category, results });
        }else{
            
            res.redirect('/getshop');
        }
        }  catch (err) {
            
            console.log(err.message);
            res.redirect('/error');

        }

        
    },

    placeOrder: async (req, res) => {
    try{
        console.log("Inside place order")


        const data = req.body;
        console.log(data);

        const session = req.session.email;
        const userData = await myDb.users.findOne({ email: session });
        const userProfileData = await profile.findOne({ email: session });
        const cartData = await cart.findOne({ userId: userData._id });
        const objId = mongoose.Types.ObjectId(userData._id)

        console.log(cartData.product);

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

        console.log(orderData.orderItems);



        if (req.body.payment === "COD") {
            const orderDatas = await orderData.save()

            console.log("Order data Saved");
            const orderId = orderDatas._id

            await order.updateOne({ _id: orderId }, { $set: { orderStatus: 'placed' } })
            await cart.deleteOne({ userId: userData._id });
            let session = req.session.email;

            console.log("coupon data",data.coupon);
            const appliedCouponName=data.coupon.toUpperCase();

            if (data.coupon && data.coupon != '') {
                await coupon.updateOne({ couponName: appliedCouponName }, { $push: { users: { userId: objId } } }).catch((err)=>{
                    console.err("coupon user Id error",message);
                    console.error(err);
                })
            }

            res.json({ success: true })

        } else {
            console.log("HERE IN ONLINE PAYMENT");
            const orderDatas = await orderData.save();
            const orderId = orderDatas._id;
            console.log(orderDatas);

            let options = {
                amount: (orderDatas.totalAmount) * 100,
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
    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
},

    orderSuccess: async (req, res) => {
    try{
        let session = req.session.email;
        const userData = await myDb.users.findOne({ email: session });
        const query = req.query;
        console.log(query);
        const orderId = query.orderId
        await order.updateOne({ _id: orderId }, { $set: { orderStatus: 'placed', paymentStatus: 'paid' } })
        await cart.deleteOne({ userId: userData._id });

        res.render('users/ordersuccess', { session })
    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
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
                order.updateOne({ _id: objId }, { $set: { paymentStatus: "paid", orderStatus: 'placed' } }).then(async () => {


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


        }  catch (err) {
            
            console.log(err.message);
            res.redirect('/error');

        }
    },

    applyCoupon: async (req, res) => {
    try{
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

                    // if (sum < invalid.minAmount) {
                    //     console.log("insidew minimum amount");
                    //     let minamount=invalid.minAmount;
                    //     res.json({minamount});
                    // }

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

    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
},

    productDetail: async (req, res) => {
    try{
        let session = req.session.email;
        const productId = req.params.id;
        console.log(productId);

        const product = await myProduct.find({ _id: productId });
        console.log(product)


        res.render('users/productDetail', { session, product })

    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
},

    orderDetails: async (req, res) => {
    try{
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
        res.render('users/orderdetails', { session, productData, orderDetails });
    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
},

    orderedProduct: async (req, res) => {
    try{
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
                        productSize: "$orderItems.size",
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

        console.log("Order details", orderDetails);
        console.log("Order details", productData);

        res.render('users/orderedProduct', { session, productData, orderDetails });
    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
},

    cancelOrder: async (req, res) => {
    try{
        const data = req.params.id;
        await order.updateOne({ _id: data }, { $set: { orderStatus: "cancelled" } })
        res.redirect("/orderDetails");

    } catch (err) {
            
        console.log(err.message);
        res.redirect('/error');

    }
}

}

