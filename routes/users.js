var router = require('express').Router(),
	User = require('../models/user.js'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

router.get("/register",function(req,res){
	res.render('register');
});

router.get("/login",function(req,res){
	res.render('login');
});

//Register
router.post("/register",function(req,res){
	var name = req.body.name;
		username = req.body.username;
		email = req.body.email;
		password = req.body.password;
		password2 = req.body.password2;

	//Validations
	req.checkBody('name','Name is required').notEmpty();
	req.checkBody('username','Username is required').notEmpty();
	req.checkBody('email','Email is required').notEmpty();
	req.checkBody('email','Email not valid').isEmail();
	req.checkBody('password','Password is required').notEmpty();
	req.checkBody('password2','Password not matching').equals(password);

	var error = req.validationErrors();

	if(error)
		res.render("register",{errors:error});
	else{
		//Saving in Mongo DB
		var newUser = new User({name:name,username:username,email:email,password:password});

		User.registerUser(newUser,function(err,user){
			if (err)
				throw err;
		});

		req.flash('success_msg', 'You are registered and can now login');
		res.redirect("/");
	}

})


passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username,function(err,userInfo){
    	if(err)
    		throw err;
    	else if(!userInfo)
    		return done(null,false,{message:'Unknown User!'});
    	else{
    		User.validatePassword(password,userInfo.password,function(err,isMatch){
    			if(err)
    				throw err;
    			else if(!isMatch)
    				return done(null,false,{message:"Invalid Password"});
    			else
    				return done(null,userInfo);
    		});
    	}
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserByID(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
	 function(req,res){
	 	res.redirect('/');
});

router.get('/logout',function(req,res){
	req.logout();
	req.flash("success_msg","You are logged out");
	res.redirect('/users/login');
})



module.exports = router;