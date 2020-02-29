const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SALT_I = 10;
require('dotenv').config();

const userSchema = mongoose.Schema({
    email:{
        type: String,
        required: true,
        trim: true,
        unique: 1
    },
    password:{
        type: String,
        required: true,
        minlength: 5
    },
    name:{
        type: String,
        required: true,
        maxlength:100
    },
    lastname:{
        type: String,
        required: true,
        maxlength:100
    },
    cart:{
        type:Array,
        default:[]
    },
    history:{
        type:Array,
        default:[]
    },
    role:{
        type:Number,
        default:0
    },
    token:{
        type:String
    }
});

userSchema.pre('save', function(next){
    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(SALT_I, function(err,salt){
            if(err) return next(err);
    
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash;
                next();
            });
        })
    }
    else {
        next()
    }
    
})


userSchema.methods.comparePassword = function(candidatePassword, cb) {  // cb stands for 'CALL BACK' function
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch){  // candidatePassword is given by user and this.password is from the database stored password.
        if(err) return cb(err);
        cb(null, isMatch)
    })
}


userSchema.methods.generateToken = function(cb){
    var user = this;                                                  
    var token = jwt.sign(user._id.toHexString(),process.env.SECRET)  //user '_id' from database which will further converted into hex-string and secret password from server environment(.env) 
                                                                     //jwt = 'json web token' is required at top of user.js file.
    user.token = token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user);
    })
}





const User = mongoose.model('User', userSchema);

module.exports = {User}