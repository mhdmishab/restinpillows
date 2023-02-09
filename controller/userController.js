//
const { render } = require('ejs');
const db = require('../config/connection');
const { findOne } = require('../model/usermodel');
const myDb = require('../model/usermodel');
const cart = require('../model/cartmodel');
const myProduct = require('../model/productmodel');
const auth = require('../utils/auth');
const newOtp = require('../model/otpmodel');
const nodemailer = require('nodemailer');
const authen = require('../utils/auth');

const { generate } = require('otp-generator');

var bcrypt = require('bcrypt');

db.dbConnect();
function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}
let msg = "";


module.exports = {
    home: async (req, res) => {
        let session = req.session.email;
        let products = await myProduct.find({});


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
            // const email=req.body.email;


            // const transporter = nodemailer.createTransport({
            //     service: 'Gmail',
            //     auth: {
            //         user: 'restinpillows77@gmail.com',
            //         pass: 'ahhiukejjocsjnxv'
            //     }
            // });
            // let user=await myDb.users.findOne({email:email});
            // if(user){
            //     console.log("user exists");
            // }else{
            //     const emailOtp=email;
            //     const otp=generateOTP();
            //     console.log(otp);
            //     const expiration=new Date();
            //     expiration.setMinutes(expiration.getMinutes() + 5);

            //     const nwOTP = new newOtp({ email: emailOtp, otp: otp, expiration: expiration });
            //     nwOTP.save(async(err)=>{
            //         if(err){
            //             res.send(err);
            //         }else{
            //         const mailOptions = {
            //             from: 'restinpillows77@gmail.com',
            //             to: email,
            //             subject: 'OTP for your account',
            //             text: `Your OTP is: ${otp}`
            //         };
            //         transporter.sendMail(mailOptions,(error,info)=>{
            //         if(error){
            //             console.log("error")
            //             console.log(error);
            //         }else{

            //             console.log(`OTP sent to ${email}: ${otp}`);
            //             res.alert(`OTP sent to ${email}`);

            //         }
            //         })
            //     }
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
    userProfile: (req, res) => {
        if (req.session.email) {
            res.render('users/userprofile');
        } else {
            res.render('login');
        }
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

    addCart: async (req, res) => {
        try {
            const id = req.params.id;
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
                    res.redirect('/viewcart')
                } else {
                    cart
                        .updateOne({ userId: userData._id }, { $push: { product: proObj } })
                        .then(() => {
                            res.redirect("/viewcart");
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
                    res.redirect("/viewcart");
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

            sum,countCart,
            // product:product,
            // countlnWishlist,

        });
    }




}
























