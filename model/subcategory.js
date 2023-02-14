const mongoose=require('mongoose');

const subcategorySchema=new mongoose.Schema({
    categoryid:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'categories'
    },

    subcategoryname:{
        type:String,
        required:true,
    },
 
});

module.exports=mongoose.model('subcategorys',subcategorySchema);