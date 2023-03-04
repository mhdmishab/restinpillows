const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({
    fullname:{type:String,trim:true,required:true},
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        trim:true,
        required:true,

    },
    unblockuser:{type:Boolean,
        default:true,
        required:true}
});





const users=mongoose.model('users',userSchema);


module.exports={
    users,
    
}

