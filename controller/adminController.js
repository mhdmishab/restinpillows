const {render}=require('ejs');
const db=require('../config/connection');
const myDbs=require('../model/usermodel');
const products=require('../model/productmodel');
const myCategory=require('../model/categorymodel');
const mySubcategory=require('../model/subcategory');
const dotenv=require('dotenv');
var bcrypt = require('bcrypt');
dotenv.config();
db.dbConnect();

let msg="";

module.exports={
    adminIndex:
    (req,res)=>{
        
        res.render('admin/adminindex');
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
    
    orders:(req,res)=>{
    
        res.render('admin/orders');
    },
    coupons:(req,res)=>{
    
        res.render('admin/coupon');
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
            let image=req.files.map((data)=>{
                return data?.filename;
            })
        const myProducts=new products({
            image:image,
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
            console.log('product added succesfully');
        }).catch(err=>{
            console.log(myProducts.category)
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
        let item= await products.findOne({_id:Id});
        let category= await myCategory.find({});
        let subcategory= await mySubcategory.find({});

        console.log(item);
        res.render('admin/editproduct',{item,category,subcategory});
        }catch(err){
            console.log("get product error")
            res.redirect('/error');
        }
    },
    editProduct:async(req,res)=>{
        
       
        console.log(req.query.id);    
    try{   let image=req.files.map((data)=>{
        return data?.filename;
    })
       
        await products.updateOne({_id:req.query.id},{
            $set:{
            image:image,
            productname:req.body.pname,
            category:req.body.category,
            subcategory:req.body.subcategory,
            quantity:req.body.quantity,
            description:req.body.description,
            price:req.body.price,
 
            }
        });
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
        
        
        console.log(subcategory);
        res.render('admin/subcategory',{subcategory,msg});  
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
            subcategoryname:req.body.mysubcategory,
            
        });
        addSubcategory.save().then((item)=>{
                console.log("subcategory added");
                res.redirect('/admin/subcategory');
            }).catch((err)=>{
                res.redirect('/admin/error');
            })
    }
        
    }catch(err){
        res.redirect('/admin/error');
    }


},






}