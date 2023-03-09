const mongoose = require('mongoose');
const moment   = require("moment");


const couponSchema = new mongoose.Schema(
    {
        couponName:{
            type:String,
            required:true,
            trim: true,
        },
        discount:{
            type:Number,
            required:true,
            trim: true,
        },
        maxLimit:{
            type:Number,
            required:true,
            trim: true,
        },
        // minAmount:{
        //     type:Number,
        //     required:true,
        //     trim: true,
        // },
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
                    required:true
                }
            }
        ]
  
    },
    {
        timestamps:true,
    }
);
module.exports= mongoose.model("coupon",couponSchema);