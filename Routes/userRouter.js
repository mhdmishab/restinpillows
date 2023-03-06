const route=require('express').Router();
const { doLogin } = require('../controller/userController');
const userController=require('../controller/userController');
const { verifyLoginAdmin, verifyLoginUser } = require('../middlewares/session');
const userSession=require('../middlewares/session');
const verifyuser=userSession.verifyUser;


route.get('/',userController.home);
route.get('/userlogin',userSession.verifyLoginUser,userController.userLogin);
route.post('/userlogin',userController.doLogin);

route.get('/getshop',userController.getShop);
route.get('/forgotpassword',userSession.verifyLoginUser,userController.forgotPassword);
route.post('/forgotpass',userSession.verifyLoginUser,userController.forgotPass);
route.get('/otpforgot',userSession.verifyLoginUser,userController.otpForgot)
route.post('/otpforgot',userSession.verifyLoginUser,userController.otpForgotpost)
route.get('/signup',userSession.verifyLoginUser,userController.userSignup)
route.post('/signup',userSession.verifyLoginUser,userController.register);
route.get('/otp',userSession.verifyLoginUser,userController.otpIndex);
route.post('/otp',userSession.verifyLoginUser,userController.otpValidation);
route.get('/logout',verifyuser,userController.userLogout);

route.get('/error',userController.errorPage);

route.post('/addcart',verifyuser,userController.addCart);
route.get('/viewProduct/:id',userController.productDetail);
route.get('/viewcart',verifyuser,userController.viewCart);
route.post('/changequantity',verifyuser,userController.changeQuantity)
route.post('/removeproduct',verifyuser,userController.deleteCartProd);
route.get('/checkout',verifyuser,userController.checkOut);
route.post('/placeOrder',verifyuser,userController.placeOrder);
route.post('/applycoupon',verifyuser,userController.applyCoupon);
route.post('/addnewaddress/:name',verifyuser,userController.addNewAddress);

route.get('/cancelOrder/:id',verifyuser,userController.cancelOrder);
route.get('/orderedProduct/:id',verifyuser,userController.orderedProduct);
route.get('/orderDetails', verifyuser,userController.orderDetails);
route.get('/orderSuccess',verifyuser,userController.orderSuccess)
route.post('/verifypayment',verifyuser,userController.verifyPayment);


route.get('/profile',verifyuser,userController.userProfile);
route.get('/editprofile',verifyuser,userController.editProfile);
route.post('/postEditProfile',verifyuser,userController.postEditProfile);
route.post('/postEditAddress',verifyuser,userController.postEditAddress);
route.post('/changePassword',verifyuser,userController.changeProfilePass);
route.post('/editaddress/:id/:name',verifyuser,userController.editAddress);
route.get('/deleteAddress/:id/:name',verifyuser,userController.deleteAddress);




route.post('/sortproducts',userController.sortProducts)
route.post('/filterproducts',userController.filterProducts);


route.use('/dosearch',(req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache');
    next();
  },userController.doSearch);










module.exports=route;
