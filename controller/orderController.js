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




    const placeOrder= async (req, res) => {




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
}






    const orderSuccess= async (req, res) => {
    let session = req.session.email;
    const query = req.query
    const orderId = query.orderId
    await order.updateOne({ _id: orderId }, { $set: { orderStatus: 'placed', paymentStatus: 'paid' } })
    await cart.deleteOne({ userId: query.cartId });

    res.render('users/ordersuccess', { session })
}

    const verifyPayment= async (req, res, next) => {
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
}

    const productDetail= async (req, res) => {
    let session = req.session.email;
    const productId = req.params.id;
    console.log(productId);

    const product = await myProduct.find({ _id: productId });
    console.log(product)


    res.render('users/productDetail', { session, product })

}

    const orderDetails= async (req, res) => {
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
}

    const orderedProduct= async (req, res) => {
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
  }


    const cancelOrder= async (req, res) => {
    const data = req.params.id;
    await order.updateOne({ _id: data }, { $set: { orderStatus: "cancelled" } })
    res.redirect("/orderDetails");

  }


  module.exports={cancelOrder,orderedProduct,orderDetails,productDetail,verifyPayment,orderSuccess,placeOrder}