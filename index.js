const express = require('express');
const app = express();
const logger = require('morgan');
const path = require('path');
require('dotenv').config({ path: '.env' });
const PORT = process.env.PORT;
const secretkey=process.env.secretkey;
const userRouter = require('./Routes/userRouter')
const adminRouter = require('./Routes/adminRouter');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const adminController = require("./controller/adminController");


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({
    secret: secretkey,
    saveUninitialized: true,
    cookie: { maxAge: 600000000 },
    resave: false
}));
app.use(function (req, res, next) {
    res.set(
        'Cache-Control', 'no-cache, private, no-store, must-revalidate,max-stale=0, post-check=0, pre-check=0');
    next();
});

app.use(logger('dev'));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', userRouter);


app.use('/admin', adminRouter);

app.use(function (req, res) {
   
    res.redirect('/error');
})










app.listen(PORT, () => {
    console.log(`PORT ${PORT} is running`);
});

