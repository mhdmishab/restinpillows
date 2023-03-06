const adroute=require('express').Router();
const adminController=require('../controller/adminController');
const adminSession=require('../middlewares/session');
const verifyAdmin=adminSession.verifyLoginAdmin;
const upload=require('../middlewares/multer');
const uploadImage = require('../middlewares/multer');


adroute.get('/adminlogin',adminController.adminLogin);
adroute.get('/',verifyAdmin,adminController.adminIndex);
adroute.get('/home',verifyAdmin,adminController.adminIndex);
adroute.post('/home',adminController.adminpost);


adroute.get('/orders',verifyAdmin,adminController.getOrders);
adroute.post('/orderStatuschange/:id',verifyAdmin,adminController.orderStatusChanging);
adroute.get('/orderedProduct/:id',verifyAdmin,adminController.getOrderedProduct)



adroute.get('/coupon',verifyAdmin,adminController.coupons);
adroute.post('/postcoupon',verifyAdmin,adminController.addCoupon);
adroute.post('/editCoupon/:id',verifyAdmin,adminController.editCoupon);
adroute.get('/deleteCoupon/:id',verifyAdmin,adminController.deleteCoupon);
adroute.get('/restoreCoupon/:id',verifyAdmin,adminController.restoreCoupon);
adroute.get('/removeCoupon/:id',verifyAdmin,adminController.removeCoupon);


adroute.get('/getBanner',verifyAdmin,adminController.getBannerPage)
adroute.post('/addBanner',verifyAdmin,adminController.addBanner)
adroute.post('/editBanner/:id',verifyAdmin,adminController.editBanner)
adroute.get('/deleteBanner/:id',verifyAdmin,adminController.deleteBanner);
adroute.get('/restoreBanner/:id',verifyAdmin,adminController.restoreBanner);
adroute.get('/removeBanner/:id',verifyAdmin,adminController.removeBanner);





adroute.get('/users',verifyAdmin,adminController.Users);
adroute.get('/blockuser',verifyAdmin,adminController.userBlock);
adroute.get('/unblockuser',verifyAdmin,adminController.userUnblock);
adroute.get('/deleteuser',verifyAdmin,adminController.deleteUser);


adroute.get('/products',verifyAdmin,adminController.products);
adroute.get('/addproducts',verifyAdmin,adminController.addproduct);
adroute.post('/addproducts',upload.array('myFiles',3),verifyAdmin,adminController.addproducts);
adroute.get('/editproduct',verifyAdmin,adminController.getProduct);

adroute.post('/changeImage1/:id',upload.single('myFile1'),verifyAdmin,adminController.changeImage1);
adroute.post('/changeImage2/:id',upload.single('myFile2'),verifyAdmin,adminController.changeImage2);
adroute.post('/changeImage3/:id',upload.single('myFile3'),verifyAdmin,adminController.changeImage3);


adroute.post('/editproduct',verifyAdmin,adminController.editProduct);
adroute.get('/unlistproduct',verifyAdmin,adminController.unlistProduct);
adroute.get('/listproduct',verifyAdmin,adminController.listProduct);

adroute.get('/category',verifyAdmin,adminController.Category);
adroute.post('/categorypost',verifyAdmin,adminController.categoryPost);
adroute.get('/deleteCategory/:id',verifyAdmin,adminController.deleteCategory);
adroute.get('/restoreCategory/:id',verifyAdmin,adminController.restoreCategory);





adroute.get('/logout',verifyAdmin,adminController.adminLogout);
adroute.get('/salesReport',verifyAdmin,adminController.salesReport);
adroute.get('/dailyReport',verifyAdmin,adminController.dailyReport);
adroute.get('/monthlyReport',verifyAdmin,adminController.monthlyReport)






adroute.get('/error',adminController.errorPage);

adroute.get('/deleteallorders',adminController.deleteorder)




module.exports=adroute;