const route=require('express').Router();
const { doLogin } = require('../controller/userController');
const userController=require('../controller/userController');
const { verifyLoginAdmin, verifyLoginUser } = require('../middlewares/session');
const userSession=require('../middlewares/session');
const verifyuser=userSession.verifyUser;


route.get('/',userController.home);
route.get('/userlogin',userSession.verifyLoginUser,userController.userLogin);
route.get('/userprofile',verifyuser,userController.userProfile);



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

route.get('/addcart/:id',verifyuser,userController.addCart);
route.get('/viewcart',verifyuser,userController.viewCart);
route.post('/changequantity',verifyuser,userController.changeQuantity)
route.get('/removeproduct/:_id/:id',verifyuser,userController.deleteCartProd);
route.get('/checkout',verifyuser,userController.checkOut);
route.post('/addnewaddress',verifyuser,userController.addNewAddress);

route.get('/profile',verifyuser,userController.userProfile);
route.get('/editprofile',verifyuser,userController.editProfile);
route.post('/postEditProfile',verifyuser,userController.postEditProfile);

// route.post('/getsubcategories',verifyuser,userController.getSubcategory)

route.use('/sortproducts',userController.sortProducts)
route.use('/filterproducts/:name',userController.filterProducts);
route.post('/dosearch',userController.doSearch);








module.exports=route;
