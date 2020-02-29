const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const mongoose = require('mongoose');
require('dotenv').config();   //used for using .env file also add as dependencies in package.json

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE);

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());

// Models
const { User } = require('./models/user');

// Middlewares
const { auth } = require('./middleware/auth');


//===============================
//             USERS
//===============================
// This request is connected with middleware -> auth.js
app.get('/api/users/auth', auth, (req,res)=>{        

    res.status(200).json({
        isAdmin: req.user.role === 0 ? false:true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        cart: req.user.cart,
        history: req.user.history
    })
})

// This request is connected with model -> user.js
app.post('/api/users/register',(req,res) => {
    const user = new User(req.body);
    user.save((err, doc) => {
        if(err) return res.json({success: false, err});
        
        res.status(200).json({
            success: true,
            // userdata: doc
        })
    })
});


// This request is connected with model -> user.js -> userSchema.methods.comparePassword, userSchema.methods.generateToken
app.post('/api/users/login', (req,res)=> {
    
    User.findOne({'email':req.body.email}, (err,user) => {
        if(!user) return res.json({loginSuccess:false, message:'Auth failed, email not found'});

        user.comparePassword(req.body.password, (err, isMatch)=>{
            if(!isMatch) return res.json({loginSuccess: false, message:'Wrong password'});

            user.generateToken((err, user)=>{
                if(err) return res.status(400).send(err);
                res.cookie('w_auth', user.token).status(200).json({        // cookie is generated from user token. 'w_auth' can be named as we wish such as 'x_auth'
                    loginSuccess: true
                })
            })

        })

    })

})


//Logout functionality is connected with middleware -> auth.js because as the user is authenticated then user can logout.
app.get('/api/user/logout', auth, (req, res)=> {
    User.findOneAndUpdate(
        { _id:req.user._id },
        { token: ''},
        (err, doc) => {
            if(err) return res.json({ success: false, err});
            return res.status(200).send({
                success: true
            })
        }
    )
})

const port = process.env.PORT || 3002;
app.listen(port, ()=>{
    console.log(`Server Running at ${port}`)
})