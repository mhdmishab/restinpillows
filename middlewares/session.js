const myDb = require('../model/usermodel');


module.exports={
    verifyLoginAdmin:(req,res,next)=>{
        if(req.session.adEmail){
            next();

        }else{
          
            res.redirect("/admin/adminlogin");
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
        if(user){
        if(user.unblockuser==false){
            req.session.email=null;
            // res.redirect('/userlogin')
        }
    }
        
        if(req.session.email){
            next();
        }else{
            res.redirect('/userlogin');
        }
    }

}  