const {render}=require('ejs');
const db=require('../config/connection');
const myDbs=require('../model/usermodel');
const products=require('../model/productmodel');
const coupon=require('../model/couponmodel');
const order=require('../model/ordermodel');
const banner=require('../model/bannermodal');
const myCategory=require('../model/categorymodel');
const mySubcategory=require('../model/subcategory');
const fs=require('fs');
const moment = require('moment');
const dotenv=require('dotenv');
var bcrypt = require('bcrypt');
const { response } = require('express');
const { default: mongoose } = require('mongoose');
dotenv.config();
db.dbConnect();

let msg="";

module.exports={
    adminIndex:
    async(req,res)=>{
    const orderData = await order.find({orderStatus:{$ne:"cancelled"}});
    const totalRevenue = orderData.reduce((accumulator,object)=>{
        return accumulator+object.totalAmount;
    },0);
    const todayOrder = await order.find({
        orderDate:moment().format("MMM Do YY"),
    });
    const todayRevenue = todayOrder.reduce((accumulator,object)=>{
        return accumulator +object.totalAmount;
    },0);
    const start = moment().startOf("month");
    const end   = moment().endOf("month");
    const oneMonthOrder = await order.find({orderStatus:{$ne:"cancelled"},createdAt:{$gte:start,$lte:end},})
    const monthlyRevenue = oneMonthOrder.reduce((accumulator,object)=>{
        return accumulator+object.totalAmount
    },0);
    const allOrders = orderData.length;
    const pending   = await order.find({orderStatus:"pending"}).count();
    const shipped = await order.find({orderStatus:"shipped"}).count();
    const placed = await order.find({orderStatus:"placed"}).count();
    const cancelled = await order.find({orderStatus:"cancelled"}).count();
    const cod    = await order.find({paymentStatus:"COD"}).count();
    const online    = await order.find({paymentStatus:"online"}).count();
    const activeUsers = await myDbs.users.find({unblockuser:true}).count();
    const product     = await  products.find({unlist:false}).count();
   
    res.render('admin/adminindex',{cod,online,pending,shipped,placed,cancelled,totalRevenue,allOrders,activeUsers,product ,monthlyRevenue,todayRevenue });
    },
    adminLogin:(req,res)=>{
        res.render("admin/adminlogin");
    },
    Users:async (req,res)=>{
    try{
        let user=await myDbs.users.find({});
        console.log("showing users")
        res.render("admin/users",{user})
    }catch(err){
        res.redirect('/admin/error');
    }
      
    },
    
   
    products:async(req,res)=>{
    try{
        
         products.find().populate('category').populate('subcategory').exec((err,product)=>{
            if(err){
                console.log("hdkshdshdksahdksahdaskjhdashkdaskdhakj");

            }else{
                res.render('admin/products',{product:product});
                console.log("showing products");
            }
        });
       
        
       
        
    }catch(err){
        res.redirect('/admin/error');
    }
    },
    
    getOrders: async(req,res)=>{
        order.aggregate([
            {
                $lookup:{
                    from:"products",
                    localField:"orderItems.productId",
                    foreignField:"_id",
                    as:"product"
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"userId",
                    foreignField:"_id",
                    as:"users"
                }
            },
            {
                $sort:{
                    createdAt:-1
                }
            } 
        ]).then((orderDetails)=>{
            res.render("admin/orders",{orderDetails});
        })
    },
    
    adminpost:(req,res)=>{
        const adEmail=process.env.Email;
        const adPassword=process.env.Password;
        const {email,password}=req.body;
        console.log(req.body);
        if(email==adEmail&&password==adPassword){
            req.session.adEmail=adEmail;
            res.redirect("/admin/home");
        }else{
            res.redirect("/admin/error");
        }
    },

    userBlock:async(req,res)=>{
        console.log(req.query.id);
        try{
        await myDbs.users.updateOne({_id:req.query.id},{$set:{unblockuser:false}});
        res.redirect("/admin/users");
        }catch(err){
            res.redirect('/error');
        }
    },
    userUnblock:async(req,res)=>{
        console.log(req.query.id);
        try{
        await myDbs.users.updateOne({_id:req.query.id},{$set:{unblockuser:true}});
        res.redirect("/admin/users");
        }catch(err){
            res.redirect('/error');
        }
    },

    deleteUser:async(req,res)=>{
        console.log(req.query.id);
        let userId=req.query.id;
        await myDbs.users.deleteOne({_id:userId});
        res.redirect("/admin/users");

    },


    addproduct:async(req,res)=>{
        let category= await myCategory.find({});
        let subcategory= await mySubcategory.find({});
        res.render('admin/addproducts',{category,subcategory});
    },
    addproducts:async(req,res)=>{
        try{
            // let image=req.files.map((data)=>{
            //     return data?.filename;
            // })
        const myProducts=new products({
            image1:req.files[0].filename,
            image2:req.files[1].filename,
            image3:req.files[2].filename,
            productname:req.body.pname,
            category:req.body.category,
            subcategory:req.body.subcategory,
            quantity:req.body.quantity,
            description:req.body.description,
            price:req.body.price,
        });
        console.log(myProducts);

        myProducts.save().then((item)=>{
            
            res.redirect('/admin/products');
            
        }).catch(err=>{
            console.log(err)
            res.redirect('/admin/addproducts')
            console.log('product addition failed');
        })
    }catch(err){
        console.log('add product error');
        res.redirect('/error');
    }

        
    },
    getProduct:async(req,res)=>{
        const Id=req.query.id;
        console.log(Id);
        try{
        let item= await products.findOne({_id:Id}).populate("category");
        let category= await myCategory.find({});
        let subcategory= await mySubcategory.find({});

        console.log(item);
        res.render('admin/editproduct',{item,category,subcategory});
        }catch(err){
            console.log("get product error")
            res.redirect('/admin/error');
        }
    },
    editProduct:async(req,res)=>{
        
       
        console.log(req.query.id);    
    try{  
        //  let image=req.files.map((data)=>{
        // return data?.filename;
        // })
       
        await products.updateOne({_id:req.query.id},{
            $set:{
         
            productname:req.body.pname,
            category:req.body.category,
            subcategory:req.body.subcategory,
            quantity:req.body.quantity,
            description:req.body.description,
            price:req.body.price,
 
            }
        }).catch(err=>{
            res.redirect('/editproduct');
        })
        console.log('product updated')
        res.redirect('/admin/products');
    }catch(err){

        console.log('product edit error');
        res.redirect('/admin/editproduct');
    };

    },
    unlistProduct:async(req,res)=>{
    try{
        console.log(req.query.id);
        await products.updateOne({_id:req.query.id},{$set:{unlist:true}});
        console.log("product unlisted");
        res.redirect('/admin/products');
    }catch(err){
        res.redirect('/error');
        console.log("product-data cannot be unlisted");
    }

},
listProduct:async(req,res)=>{
try{
    console.log(req.query.id);
        await products.updateOne({_id:req.query.id},{$set:{unlist:false}});
        console.log("product listed");
        res.redirect('/admin/products');

}catch{
    res.redirect('/error');
    console.log("product-data cannot be listed");
}
},

Category:async(req,res)=>{
  try{  
    let category=await myCategory.find({});
    console.log("helloooooooo");
    console.log(category);
    let subcategory= await mySubcategory.find({});
    res.render('admin/category',{category,msg});  
    msg="";
  }catch(err){
    res.redirect('/admin/error');
  }
 },

categoryPost:async(req,res)=>{
try{
    const category=req.body.mycategory;
    console.log(req.body.mycategory);
    console.log(category);
    
    let categ= await myCategory.findOne({categoryname:category});

    if(categ){
        msg="Category already added";
        res.redirect('/admin/category')

    }else{
    
    const addCategory=new myCategory({
        categoryname:category,
        subcategory:req.body.subcategory,
    });
    addCategory.save().then((item)=>{
            console.log("category added");
            res.redirect('/admin/category');
        }).catch((err)=>{
            res.redirect('/admin/error');
        })
    }
    
}catch(err){
    res.redirect('/admin/error');
}
    
},

adminLogout:(req,res)=>{
    req.session.adEmail=null;
    res.redirect('/admin');
},

errorPage:(req,res)=>{
    res.render('admin/error');
},

Subcategory:async(req,res)=>{
    try{  
        let subcategory=await mySubcategory.find({});
        
        let category=await myCategory.find({});
        console.log(subcategory);
        res.render('admin/subcategory',{subcategory,msg,category});  
        msg="";
      }catch(err){
        res.redirect('/admin/error');
      }

},

subcategoryPost:async(req,res)=>{
    try{
        let categ= await mySubcategory.findOne({subcategoryname:req.body.mysubcategory});

    if(categ){
        msg="Sub-category already added";
        res.redirect('/admin/subcategory')

    }else{
       
        
        const addSubcategory=new mySubcategory({
            categoryid:req.body.category,
            subcategoryname:req.body.mysubcategory,
            
        });
        const categoryID=addSubcategory.categoryid;
        const obj=addSubcategory.subcategoryname;
        addSubcategory.save().then(async(item)=>{
                console.log("subcategory added");
                
                await myCategory.updateOne({_id:categoryID},{$push:{subcategory:obj}});
                res.redirect('/admin/subcategory');

            })
            


            .catch((err)=>{
                res.redirect('/admin/error');
            })
    }
        
    }catch(err){
        res.redirect('/admin/error');
    }


},

getSubcategory:async(req,res)=>{
    
    const categoryID= req.body.category;
    const categoryId=mongoose.Types.ObjectId(categoryID);
    console.log(categoryId);
    const subcategories=await mySubcategory.find({categoryid:categoryId});
    res.json(subcategories);
},

coupons:async(req,res)=>{
    const couponData = await coupon.find();
    res.render('admin/coupon',{couponData});
   
},

addCoupon: (req,res)=>{
    try{
        console.log("inside addcoupon");
      const data = req.body;
      const dis  = parseInt(data.discount);
      const maxLimit = parseInt(data.maxLimit);
      const minAmount = parseInt(data.minAmount);
      const discount = dis/100;
      coupon.create({
        couponName:data.couponName,
        discount:discount,
        maxLimit:maxLimit,
        minAmount:minAmount,
        expirationTime:data.expirationTime,
      }).then((data)=>{
        // console.log(data);
        res.redirect("/admin/coupon")
      });
    }catch{
        console.error();
        res.render("admin/error")
    }
}, 

editCoupon:async(req,res)=>{
    try{ 
    const id = req.params.id;
    const data = req.body;
    coupon.updateOne(
        {_id:id},
        {
            couponName:data.couponName,
            discount:data.discount/100,
            maxLimit:data.maxLimit,
            expirationTime:data.expirationTime
        }
    ).then(()=>{
        res.redirect("/admin/coupon");
    })
}catch{
   console.error();
}
},

deleteCoupon:async (req,res)=>{
    const id = req.params.id;
    await coupon.updateOne({_id:id},{$set:{delete:true}})
    res.redirect('/admin/coupon');
},
restoreCoupon:async(req,res)=>{
    const id = req.params.id;
    await coupon.updateOne({_id:id},{$set:{delete:false}});
    res.redirect("/admin/coupon");
},
removeCoupon:async(req,res)=>{
    const id = req.params.id;
    await coupon.deleteOne({_id:id});
    res.redirect("/admin/coupon");
},


changeImage1:async(req,res)=>{
    try{
        await products.updateOne({_id:req.params.id},
            {$set:
                {
                    image1:req.file.filename
                }
            })

            const directoryPath = "public/"+req.body.image1;
            fs.unlink(directoryPath,(err)=>{
                try{
                    if(err){
                        throw err;
                    }
                    console.log("Delete Image 1 succesfully");
                }catch(err){
                    console.error(`error Deleting Image1:${err}`);
                }
            });
            res.redirect('/admin/products')

    }catch(err){
        console.log(`Error change image1:${err}`);
        res.redirect('/admin/products');
       

    }

},

changeImage2:async(req,res)=>{
    try{
        await products.updateOne({_id:req.params.id},
            {$set:
                {
                    image2:req.file.filename
                }
            })

            const directoryPath = "public/"+req.body.image2;
            fs.unlink(directoryPath,(err)=>{
                try{
                    if(err){
                        throw err;
                    }
                    console.log("Delete Image 2 succesfully");
                }catch(err){
                    console.error(`error Deleting Image2:${err}`);
                }
            });
            res.redirect('/admin/products')

    }catch(err){
        console.log(`Error change image2:${err}`);
        res.redirect('/admin/products');
       

    }

},

changeImage3:async(req,res)=>{
    try{
        await products.updateOne({_id:req.params.id},
            {$set:
                {
                    image3:req.file.filename
                }
            })

            const directoryPath = "public/"+req.body.image3;
            fs.unlink(directoryPath,(err)=>{
                try{
                    if(err){
                        throw err;
                    }
                    console.log("Delete Image 3 succesfully");
                }catch(err){
                    console.error(`error Deleting Image1:${err}`);
                }
            });
            res.redirect('/admin/products')

    }catch(err){
        console.log(`Error change image3:${err}`);
        res.redirect('/admin/products');
       

    }

},

orderStatusChanging:async(req,res)=>{
    const id = req.params.id;
    const data = req.body;
    await order.updateOne(
        {_id:id},
        {
            $set:{
                orderStatus:data.orderStatus,
                paymentStatus:data.paymentStatus,
            }
        }
    )
    res.redirect("/admin/orders");


},

getOrderedProduct:async (req,res)=>{
    const id = req.params.id;
    
  
    const objId = mongoose.Types.ObjectId(id)

    console.log(objId);
    const productData = await order.aggregate([
        {
            $match: {_id:objId }
        },
        {
            $unwind: "$orderItems"
        },
        {
            $project: {
                productItem: "$orderItems.productId",
                productQuantity: "$orderItems.quantity",
                address: 1, 
                name: 1,
                phoneNumber: 1  
            }
        },
        {
            $lookup: {
                from: "products",
                localField: "productItem",
                foreignField: "_id",
                as: "productDetail"
            }
        },
        {
            $project: {
                productItem: 1,
                productQuantity: 1,
                address: 1,
                name: 1,
                phoneNumber: 1,
                productDetail: { $arrayElemAt: ["$productDetail", 0] }
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
    
    ]).exec();

    console.log("orderproductData",productData);
    res.render('admin/orderedproduct',{productData})
},

deleteorder:async()=>{
    console.log("delete order allllllllll")
    await order.deleteMany({});
},



getBannerPage:async(req,res)=>{
    const bannerData = await banner.find()
    res.render('admin/banner',{bannerData});
},

addBanner:async(req,res)=>{
    try{
        await banner.create({
            offerType:req.body.offerType,
            bannerText:req.body.bannerText,
            couponName:req.body.couponName,  
        }).then((data)=>{
            res.redirect('/admin/getBanner')
        })
    }catch{
       console.error();
       res.render('user/error');
    }

},
editBanner:async(req,res)=>{ 
  try{
    const id = req.params.id;
    const editedData = req.body;
    await banner.updateOne(
        {_id:id},
        {
            offerType:editedData.offerType,
            bannerText:editedData.bannerText,
            couponName:editedData.couponName,    
        }
        ).then(()=>{
            res.redirect('/admin/getBanner');
        })
  }catch{
    console.error()
    res.render("users/error")
  }
},

deleteBanner:async(req,res)=>{
    try{
      const id= req.params.id;
      await banner.updateOne(
          {_id:id},
          {isDeleted:true}
      ).then(()=>{
          res.redirect('/admin/getBanner');
      })
    }catch{
      console.error();
      res.render("user/error");
    }
  },
  restoreBanner:async(req,res)=>{
    try{
      const id = req.params.id;
      await banner.updateOne(
          {_id:id},
          {isDeleted:false}
      ).then(()=>{
          res.redirect('/admin/getBanner');
      })
    }catch{
      console.error()
      res.redirect("/admin/getBanner");
    }
  }









}

