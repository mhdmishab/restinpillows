const { render } = require('ejs');
const db=require('../config/connection');
const { findOne } = require('../model/usermodel');
const myDb=require('../model/usermodel');
const { generate } = require('otp-generator');
const nodemailer = require('nodemailer');
const newOtp=require('../model/otpmodel');


function generateOTP() {
    return Math.floor(1000 + Math.random() * 9000);
}


async function otp(mail){
    
    const email=mail;
        

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'restinpillows77@gmail.com',
            pass: 'ahhiukejjocsjnxv'
        }
    });
    // let user=await myDb.users.findOne({email:email});
    // if(user){
    //     console.log("user exists");
    // }else{
        const emailOtp=email;
        const otp=generateOTP();
        console.log(otp);
        const expiration=new Date(Date.now() + 1 * 60 * 1000);
        

        const nwOTP = new newOtp({ email: emailOtp, otp: otp, expiration: expiration });
        nwOTP.save(async(err)=>{
            if(err){
                res.send(err);
            }else{
            const mailOptions = {
                from: 'restinpillows77@gmail.com',
                to: email,
                subject: 'OTP for your account',
                text: `Your OTP is: ${otp}`
            };
            transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log("error")
                console.log(error);
            }else{
                
                console.log(`OTP sent to ${email}: ${otp}`);
                res.alert(`OTP sent to ${email}`);
                
            }
            })
        }

    })
}



// return async function otpValidation(){
//     let status;
// try{
//     const otp=req.body.emailOtp;
//         console.log(typeof(otp));
//         console.log(otp);
//         newOtp.findOne({otp:otp},(err,otpDetails)=>{
//             if (err) {
//                 console.log(otpDetails);
//                 console.log("ERROE1");
                
//             }else{
//                 if(otpDetails){
//                     if (otpDetails.expiration > Date.now()) {
//                         status=true;
//                         console.log('OTP validated successfully');

//                             myDetails.save().then(item => {
//                             res.redirect('/userprofile')
//                           })
//                           .catch(err => {
//                             console.log("unable to save to database");
//                             res.redirect('/signup');
//                           });

//                         }else{
//                             console.log("OTP expired");
//                             res.redirect('/signup');
                           
//                         }
//                 }else{
//                     console.log('Invalid OTP');
//                     res.redirect('/signup');
                    
//                 }
//             }
//         })
//         newOtp.deleteMany({},(err)=>{
//             if(err){
//                 console.log('error');
//                 console.log(err);
//             }
//         });
//     }catch(err){
//         status=false;
        
//     }
// }


module.exports={otp};
    


