
const { render } = require('ejs');
const db = require('../config/connection');
const { findOne } = require('../model/usermodel');
const myDb = require('../model/usermodel');
const cart = require('../model/cartmodel');
const order = require('../model/ordermodel');
const myProduct = require('../model/productmodel');
const myCategory = require('../model/categorymodel');
// const mySubcategory = require('../model/subcategory');
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

const userProfile= async (req, res) => {
    const session = req.session.email;
    let userData = await myDb.users.findOne({ email: session })
    let userProfile = await profile.findOne({ email: session });
    if (userProfile) {
        res.render('users/profile', { session, userData, userProfile })
    } else {
        res.render('users/profile', { session, userData, userProfile });
    }
}

const changeProfilePass= async (req, res) => {
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


}

const editProfile= async (req, res) => {
    const session = req.session.email;
    let userData = await myDb.users.findOne({ email: session })
    let userProfile = await profile.findOne({ email: session });

    if (userProfile) {
        res.render('users/editprofile', { session, userData, userProfile });
    } else {

        res.render('users/editprofile', { session, userData, userProfile });
    }

}

const postEditProfile= async (req, res) => {
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
}

module.exports={changeProfilePass,editProfile,postEditProfile,userProfile}
