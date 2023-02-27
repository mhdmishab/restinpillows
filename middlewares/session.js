const myDb = require('../model/usermodel');


module.exports={
    verifyLoginAdmin:(req,res,next)=>{
        if(req.session.adEmail){
            next();

        }else{
            res.render("admin/adminlogin");
        }
    },

    verifyLoginUser:(req,res,next)=>{
        if(req.session.email){
            res.redirect('/');
        }else{
            next();
        }

    },

    verifyUser:async(req,res,next)=>{
        const user=await myDb.users.findOne({email:req.session.email});
        console.log(user.unblockuser);
        if(user.unblockuser==false){
            req.session.email=null;
        }
        
        if(req.session.email){
            next();
        }else{
            res.redirect('/userlogin');
        }
    }

}