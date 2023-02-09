const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    fullname:{type:String,required:true},
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    unblockuser:{type:Boolean,required:true}
});





const users=mongoose.model('users',userSchema);


module.exports={
    users,
    
}

