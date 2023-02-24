const mongoose=require('mongoose');

const profileSchema=new mongoose.Schema({
    fullname:{type:String,
      trim: true,
      required:true},
    email:{
        type:String,
        required:true,
        unique:true
    },
    phone:{
        type:Number,
        trim: true,
        

    },
    addressDetails:[
        {
         housename:{
            type:String,
            trim: true,

         },
         area:{
            type:String,
            trim: true,
         },
         landmark:{
            type:String,
            trim: true,
         },
         district:{
            type:String,
            trim: true,
         },
         postoffice:{
            type:String,
            trim: true,
         },
         state:{
            type:String,
            trim: true,
         },
         pin:{
            type:String,
            trim: true,
         }
        }
    ],
    
    
});





module.exports=mongoose.model('profiles',profileSchema);