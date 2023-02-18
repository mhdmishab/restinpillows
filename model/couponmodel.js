const mongoose = require('mongoose');
const moment   = require("moment");


const couponSchema = new mongoose.Schema(
    {
        couponName:{
            type:String,
            required:true
        },
        discount:{
            type:Number,
            required:true
        },
        maxLimit:{
            type:Number,
            required:true
        },
        startDate:{
            type:String,
            default:moment().format("DD/MM/YYYY") +" "+ moment().format("hh:mm:ss"),
        },
        expirationTime:{
            type:String,
            required:true
        },
        delete:{  
            type:Boolean,
            default:false
        },
        users:[
            {
                userId:{
                    type:mongoose.Schema.Types.ObjectId,
                }
            }
        ]
  
    },
    {
        timestamps:true,
    }
);
module.exports= mongoose.model("coupon",couponSchema);