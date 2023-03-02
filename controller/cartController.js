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

const addCart= async (req, res) => {
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
}

const viewCart= async (req, res) => {
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

}

const changeQuantity= async (req, res) => {
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
            { $match: { userId: cartData[0].userId  } },
            { $project: { count: { $size: "$product" } } }
          ]);
        res.status(200).send({ data: "this is data", newdata, zeroQuantity, sum,countCart });


    });





}

const deleteCartProd= async (req, res) => {

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
        .then(async() => {
            const Cart=await cart.findOne({_id: cartId});
            const countCart=Cart.product.length;
            res.json({ countCart });
            // res.redirect('/viewcart');

        });






}


module.exports={deleteCartProd,changeQuantity,viewCart,addCart}

