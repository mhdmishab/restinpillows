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

    verifyUser:(req,res,next)=>{
        if(req.session.email){
            next();
        }else{
            res.redirect('/userlogin');
        }
    }

}