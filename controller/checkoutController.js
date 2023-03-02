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



const checkOut= async (req, res) => {
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


}

const applyCoupon= async (req, res) => {
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

}

module.exports={checkOut,applyCoupon}
