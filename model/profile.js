const mongoose=require('mongoose');

const profileSchema=new mongoose.Schema({
    fullname:{type:String,required:true},
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        trim: true,
        required:true,
    },
    addressDetails:[
        {
         housename:{
            type:String,
         },
         area:{
            type:String,
         },
         landMark:{
            type:String,
         },
         district:{
            type:String,
         },
         postoffice:{
            type:String,
         },
         state:{
            type:String,
         },
         pin:{
            type:String,
         }
        }
    ],
    
    
});





module.exports=mongoose.model('profiles',profileSchema);