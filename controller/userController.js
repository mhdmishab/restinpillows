//
const { render } = require('ejs');
const db = require('../config/connection');
const { findOne } = require('../model/usermodel');
const myDb = require('../model/usermodel');
const cart = require('../model/cartmodel');
const order=require('../model/ordermodel');
const myProduct = require('../model/productmodel');
const myCategory = require('../model/categorymodel');
const mySubcategory = require('../model/subcategory');
const auth = require('../utils/auth');
const newOtp = require('../model/otpmodel');
const nodemailer = require('nodemailer');
const authen = require('../utils/auth');
const profile = require('../model/profile');


const { generate } = require('otp-generator');

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

    editProfile: async (req, res) => {
        const session = req.session.email;
        let userData = await myDb.users.findOne({ email: session })
        let userProfile = await profile.findOne({ email: session });

        res.render('users/editprofile', { session, userData, userProfile });

    },

    postEditProfile: async (req, res) => {
        const session = req.session.email;
        let userProfile = await profile.findOne({ email: session });
        if (userProfile) {
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
            await myDb.users.updateOne(
                { email: session },
                {
                    $set: {
                        fullname: req.body.fullname,
                        email: req.body.email,


                    }
                }
            )
            nwprofile.save();
        }
        res.redirect('/profile')
    },

    changeQuantity: async (req, res) => {
        let session=req.session.email;
        const userData=await myDb.users.find({email:session});
        console.log(111);
        const data = req.body;
        console.log(data);
        const objId = data.product;
        let zeroQuantity=false;

        let newdata;
       
        
            
        
       
        cart.updateOne(
            { _id: data.cart, "product.productId": objId },
            { $inc: { "product.$.quantity": data.count } }
        ).then(async() => {
            newdata=await cart.findOne({_id:data.cart},{product:{$elemMatch:{productId:objId}}});
            if(newdata==null){
            console.log("newdata is here"+newdata);
            res.redirect('/viewcart');
            }
            if(newdata.product[0].quantity==0||newdata.product[0].quantity<0){
                await cart.deleteOne({_id:data.cart},{product:{$elemMatch:{productId:objId}}})
                zeroQuantity=true;
            }
            let productData= await cart.aggregate([
                { 
                    $match:{userId:userData._id}
                },
                {
                    $unwind:"$product",
                },
                {
                    $project:{
                        productItem:"$product.productId",
                        productQuantity:"$product.quantity"
                    }

                },
                {
                    $lookup:{
                        from:"products",
                        localField:"productitem",
                        foreignField:"_id",
                        as:"productDetail",
                    }
                },
                {
                    $project: {
                        productItem: 1,
                        productQuantity: 1,
                        productDetail: { $arrayElemAt: ["$productDetail", 0] },
                    },
                },
                {
                    $addFields:{
                        productPrice:{
                            $multiply:["$productQuantity", "$productDetail.price"]
                        }
                    }
                }
                
            ]).exec();
            console.log("lookupp",productData);
            const sum = productData.reduce((accumulator, object) => {
                return accumulator + object.productPrice;
            }, 0);
            console.log("helooo sum",sum)
            res.status(200).send({data:"this is data",newdata,zeroQuantity,sum});

            
        });

    



    },

    deleteCartProd: async (req, res) => {

        const cartid = req.params._id;
        const cartId = mongoose.Types.ObjectId(cartid);
        const productid = req.params.id;
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
                //   res.json({ status: true });
                res.redirect('/viewcart');

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
        const session = req.session.email;
        const category = await myCategory.find({});
        const product = await myProduct.find({ unlist: false }).populate('category');
        let productCount = await myProduct.find({ unlist: false }).count();
        res.render('users/shop', { session, product, category, productCount });

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
            let products = await myProduct.find({ unlist: false });
            const category = await myCategory.find({});
            let sortedProducts = [];
            let product;

            let sortby = req.query.sortby;

            if (sortby === "asending") {
                sortedProducts = products.sort((a, b) => a.productname.localeCompare(b.productname));
                product = sortedProducts;
                res.render('users/shop', { session, product, category });

            } else if (sortby === "decending") {
                sortedProducts = products.sort((a, b) => b.productname.localeCompare(a.productname));
                product = sortedProducts;
            } else if (sortby === "price_asc") {
                sortedProducts = products.sort((a, b) => a.price - b.price);
                product = sortedProducts;
            } else if (sortby === "price_des") {
                sortedProducts = products.sort((a, b) => b.price - a.price);
                product = sortedProducts;
            } else {
                res.redirect('/getshop');
            }
            res.render('users/shop', { session, product, category });
        } catch (err) {
            res.redirect('/error');
        }





    },

    filterProducts: async (req, res) => {
        let session = req.session.email;
        try {
            let products = await myProduct.find({ unlist: false });
            const category = await myCategory.find({});
            let filteredProducts = [];
            let product;
            console.log(req.params.name);



            if (req.params.name == "category") {
                console.log("respod is here");

                let selectedCategories = req.query.categorys || [];


                console.log(selectedCategories);
                // filteredProducts=products.filter(product=>{
                //     console.log(product.category);
                //     return (product.category.Some(category => selectedCategories.includes(category)))

                // });

                filteredProducts = products.filter(product => selectedCategories.includes(product.category));

                product = filteredProducts;
            } else if (req.params.name == "price") {

                let min = req.query.min || 0;
                let max = req.query.max || 10000;

                filteredProducts = products.filter(product => {
                    return product.price >= min && product.price <= max;
                });

                product = filteredProducts;
            } else {
                res.redirect('/getshop');
            }
            res.render('users/shop', { session, product, category });
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



        let invalid;
        let couponDeleted;
        const data = req.body;
        const session = req.session.email;
        const userData = await myDb.users.findOne({ email: session });
        const userProfileData = await profile.findOne({ email: session });
        const cartData = await cart.findOne({ userId: userData._id });
        const objId = mongoose.Types.ObjectId(userData._id)
        if (data.coupon) {
          invalid = await coupon.findOne({ couponName: data.coupon });
          // console.log(invalid);
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
          // console.log(discount);
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
                      productSize:"$Product.size"
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
                      productSize:1,
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
              const orderData = new order({
                userId: userData._id,
                name: userProfileData.name,
                phoneNumber: userProfileData.phone,
                address: req.body.address, 
                orderItems: cartData.product,
                totalAmount: total,
                paymentMethod: req.body.paymentMethod,
                orderDate: moment().format("MMM Do YY"),
                deliveryDate: moment().add(3, "days").format("MMM Do YY")
              });
             
              
              
              if (req.body.paymentMethod === "COD")  {
              const orderDatas = await orderData.save()
              const orderId   = orderDatas._id
                
              await order.updateOne({_id:orderId},{$set:{orderStatus:'placed'}})       
              await cart.deleteOne({ userId: userData._id });
              res.json({ success: true})
              await coupon.updateOne( {couponName:data.coupon}, {$push:{users: {userId : objId}}})
              } else {
                const orderDatas = await  orderData.save();
                const orderId = orderDatas._id;
    
                const session = await stripe.checkout.sessions.create({ 
                  payment_method_types: ["card"], 
                  line_items:
                    productData.map((ele) => {
                      return { 
                        price_data: { 
                          currency: "inr", 
                          product_data: { 
                            name: ele.productDetail.name, 
                          }, 
                          unit_amount:ele.productDetail.price * 100, 
                        }, 
                        quantity: ele.productQuantity, 
                      }
                    }), 
                  mode: "payment",  
                  success_url: `${process.env.SERVER_URL}/orderSuccess?cartId=${userData._id}&orderId=${orderId}`,
                  cancel_url:  `${process.env.SERVER_URL}/checkout?orderId=${orderId}` 
                });  
                console.log(session);
                res.json({ url: session.url})      
              } 
    
            } else { 
       
              res.redirect("/viewCart");
            }
          }
        }
      },

     









}
























