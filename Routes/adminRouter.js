const adroute=require('express').Router();
const adminController=require('../controller/adminController');
const adminSession=require('../middlewares/session');
const verifyAdmin=adminSession.verifyLoginAdmin;
const upload=require('../middlewares/multer');


adroute.get('/',verifyAdmin,adminController.adminIndex);
adroute.get('/home',verifyAdmin,adminController.adminIndex);
adroute.post('/home',adminController.adminpost);


adroute.get('/orders',verifyAdmin,adminController.getOrders);



adroute.get('/coupon',verifyAdmin,adminController.coupons);
adroute.post('/postcoupon',verifyAdmin,adminController.addCoupon);
adroute.post('/editCoupon/:id',verifyAdmin,adminController.editCoupon);
adroute.get('/deleteCoupon/:id',verifyAdmin,adminController.deleteCoupon);
adroute.get('/restoreCoupon/:id',verifyAdmin,adminController.restoreCoupon);
adroute.get('/removeCoupon/:id',verifyAdmin,adminController.removeCoupon);





adroute.get('/users',verifyAdmin,adminController.Users);
adroute.get('/blockuser',verifyAdmin,adminController.userBlock);
adroute.get('/unblockuser',verifyAdmin,adminController.userUnblock);
adroute.get('/deleteuser',verifyAdmin,adminController.deleteUser);


adroute.get('/products',verifyAdmin,adminController.products);
adroute.get('/addproducts',verifyAdmin,adminController.addproduct);
adroute.post('/addproducts',upload.array('image',3),adminController.addproducts);
adroute.get('/editproduct',verifyAdmin,adminController.getProduct);
adroute.post('/editproduct',verifyAdmin,adminController.editProduct);
adroute.get('/unlistproduct',verifyAdmin,adminController.unlistProduct);
adroute.get('/listproduct',verifyAdmin,adminController.listProduct);

adroute.get('/category',verifyAdmin,adminController.Category);
adroute.post('/categorypost',verifyAdmin,adminController.categoryPost);

adroute.get('/subcategory',verifyAdmin,adminController.Subcategory);
adroute.post('/subcategorypost',verifyAdmin,adminController.subcategoryPost);
adroute.post('/getsubcategories',verifyAdmin,adminController.getSubcategory)



adroute.get('/logout',verifyAdmin,adminController.adminLogout);




adroute.get('/error',adminController.errorPage);




module.exports=adroute;