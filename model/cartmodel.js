const mongoose=require('mongoose');

const cartSchema=new mongoose.Schema({

    userId:{
        type:String,
        required:true,
    },
    product:[{
        productId:{
            type:mongoose.SchemaTypes.ObjectId,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        productprice:{
            type:Number,
        }
    }]
    
    
});

module.exports=mongoose.model('carts',cartSchema);