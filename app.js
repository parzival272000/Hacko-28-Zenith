var express=require("express");
var methodOverride=require("method-override");
var app=express();
var passport=require("passport");
var flash=require("connect-flash");
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var User=require("./models/user");
var Comment=require("./models/comment");
var LocalStrategy=require("passport-local");
var passportLocalMongoose=require("passport-local-mongoose");
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/share_to_healv5",{useNewUrlParser: true});
app.use(require("express-session")({
	secret:"Khuljasimsim",
	resave:false,
	saveUninitialized:false
}));

app.set('view engine',"ejs");
app.use(methodOverride("_method"));
app.use(flash());
app.use(express.static(__dirname + '/public'));//this line corrects the MIME error
app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});
var postSchema=new mongoose.Schema({
	title:String,
	image:String,
	description:String,
	created: {type: Date, default: Date.now},
	author:
	{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		username:String
	},
	comments:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Comment"
	}]
});
var Post= mongoose.model("Post", postSchema);
var prouserSchema=new mongoose.Schema({
	prousername:String,
	propassword:String,
	procategory:String
});
var ProUser=mongoose.model("ProUser",prouserSchema);
//landing
app.get("/",function(req,res){
	res.render("landing");
});
//index
app.get("/posts", function(req,res){
	Post.find({},function(err,posts){
		if(err)
			{
				console.log("ERROR!");
			}
		else 
			{
				res.render("index",{posts:posts})
			}
	});
});
app.get("/poststr", function(req,res){
	Post.find({},function(err,posts){
		if(err)
			{
				console.log("ERROR!");
			}
		else 
			{
				res.render("indextr",{posts:posts})
			}
	});
});
app.get("/postsstr", function(req,res){
	Post.find({},function(err,posts){
		if(err)
			{
				console.log("ERROR!");
			}
		else 
			{
				res.render("indexstr",{posts:posts})
			}
	});
});
app.get("/postsill", function(req,res){
	Post.find({},function(err,posts){
		if(err)
			{
				console.log("ERROR!");
			}
		else 
			{
				res.render("indexill",{posts:posts})
			}
	});
});
app.get("/postsother", function(req,res){
	Post.find({},function(err,posts){
		if(err)
			{
				console.log("ERROR!");
			}
		else 
			{
				res.render("other",{posts:posts})
			}
	});
});
/*Post.create({
	title: "fff",
	image: "https://images.unsplash.com/photo-1499334650700-42e4f7ffc63d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
	body: "Hello this is a new recipe"
});*/

//newp
app.get("/posts/new",isLoggedIn,function(req,res){
	res.render("new");
});
//create route
app.post("/Posts",isLoggedIn,function(req,res)
{
	var title=req.body.title;
	var image=req.body.image;
	var desc=req.body.description;
	var author={
		id:req.user._id,
		username:req.user.username
	}
	var newPost={title:title,image:image,description:desc,author:author};
    Post.create(newPost,function(err,newlyCreated)
	    {
		   if(err)
	        {
				console.log(err);
		       res.render("new");
	        }
	        else
		    {
			   res.redirect("/posts");
		    }
				});
});
//show
app.get("/posts/:id",function(req,res)
	   {
	      Post.findById(req.params.id).populate("comments").exec(function(err,foundPost){
			  if(err)
				  {
					  res.redirect("/posts");
				  }
			  else
			      {
			       	  res.render("show",{post:foundPost})  
			      }
		  })
});
//EDIT Route
app.get("/posts/:id/edit",isLoggedIn,function(req,res){
	    Post.findById(req.params.id,function(err, foundPost){
			if(err)
				{
					res.redirect("/posts");
				}
			else
			    {
					res.render("edit",{post: foundPost});
				}
		});
	});
//update
app.put("/posts/:id",isLoggedIn,function(req,res){
	Post.findByIdAndUpdate(req.params.id,req.body.post,function(err, updatedPost){
		if(err)
			{
				res.redirect("/posts");
			}
		else
			{
				res.redirect("/posts/" + req.params.id);
			}
	});
});
//delete
app.delete("/posts/:id",checkPostOwnership, function(req,res){
	Post.findByIdAndRemove(req.params.id,function(err){
		if(err)
			{
				res.redirect("/posts");
			}
		else
		    {
				res.redirect("/posts");
			}
	});
});
//comments----------------
app.get("/posts/:id/comments/new",isLoggedIn,function(req,res){
	Post.findById(req.params.id,function(err,post){
		if(err)
			{
				console.log(err);
			}
		else
			{
				res.render("comments/new",{post:post});
			}
	});
});
app.post("/posts/:id/comments",isLoggedIn,function(req,res){
	Post.findById(req.params.id,function(err,post){
		if(err)
			{
				console.log(err);
				res.redirect("/posts");
			}
		else
			{
				Comment.create(req.body.comment,function(err,comment){
					if(err)
						{
							console.log(err);
						}
					else
						{
							//add username ,id
							comment.author.id=req.user._id;
							comment.author.username=req.user.username;
							comment.save();
							post.comments.push(comment);
							post.save();
							//req.flash("success","Successfully added comment");
							res.redirect("/posts/"+post._id);
						}
				});
			}
	});
});
app.get("/posts/:id/comments/:comment_id/edit",checkCommentOwnership,function(req,res){
	Comment.findById(req.params.comment_id,function(err,foundComment){
		if(err)
			{
				res.redirect("back");
			}
		else
			{
				res.render("comments/edit",{post_id:req.params.id,comment:foundComment});
			}
	});
});
//comments update
app.put("/posts/:id/comments/:comment_id",checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err)
			{
				res.redirect("back");
			}
		else
			{
				res.redirect("/posts/"+req.params.id);
			}
	});
});
//comments destroy
app.delete("/posts/:id/comments/:comment_id",checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err)
			{
				res.redirect("back");
			}
		else
			{
				req.flash("success","Comment deleted")
				res.redirect("/posts/"+req.params.id);
			}
	});
});


//Authentication
app.get("/register",function(req,res){
	res.render("SignUp");
});
//handling signup
app.post("/register",function(req,res){
	req.body.username
	req.body.password
	User.register(new User({username:req.body.username}),req.body.password,function(err,user){
		if(err)
			{
				console.log(err);
				return res.render("SignUp");
			}
		else
			{
				passport.authenticate("local")(req,res,function(){
					res.redirect("/posts");
				});
			}
	});
});

//profsignup=====================
app.get("/profregister",function(req,res){
	res.render("SignUpAsProf");
});
//handling signup
app.post("/profregister",function(req,res){
	req.body.username
	req.body.password
	ProUser.register(new ProUser({username:req.body.username}),req.body.password,function(err,prouser){
		if(err)
			{
				console.log(err);
				return res.render("SignUpAsProf");
			}
		else
			{
				passport.authenticate("local")(req,res,function(){
					res.redirect("/posts");
				});
			}
	});
});
//================================
//login
app.get("/login",function(req,res){
	res.render("login");
});
app.post("/login",passport.authenticate("local",{
	successRedirect:"/posts",
	failureRedirect:"/login"
})
    , function(req,res){
	
});
//
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/posts");
});
//middleware
//checkownership===========
function checkPostOwnership(req,res,next){
	if(req.isAuthenticated())
		{
		    Post.findById(req.params.id,function(err,foundPost){
		    if(err)
			   {
				   //req.flash("error","Campground not found");
				   res.redirect("back");
			   }
		    else
			   {
				   if(foundPost.author.id.equals(req.user._id))//foundCampground.author.id is a mongoose object  whereas req.user._id is a string(BTS)
					   {
						    next();
					   }
				   else
					   {
						   //req.flash("error","You are not authorised to do that");
						   res.redirect("back");
					   }
			   }
	        });	
		}
	else
		{
			//req.flash("error","You need to be logged in");
			res.redirect("back");
		}
}
function checkCommentOwnership(req,res,next){
	if(req.isAuthenticated())
		{
		    Comment.findById(req.params.comment_id,function(err,foundComment){
		    if(err)
			   {
				   res.redirect("back");
			   }
		    else
			   {
				   if(foundComment.author.id.equals(req.user._id))//foundComment.author.id is a mongoose object  whereas req.user._id is a string(BTS)
					   {
						    next();
					   }
				   else
					   {
						   //req.flash("error","You are not authorised to do that");
						    res.redirect("back");
					   }
			   }
	        });	
		}
	else
		{
			//req.flash("error","You need to be logged in");
			res.redirect("back");
		}
}

function isLoggedIn(req,res,next)//<==================middleware
{
    if(req.isAuthenticated())
		{
			return next();
		}
	res.redirect("/login");
}
const port=process.env.PORT || 4100
app.listen(port,function(){
    console.log("Share To Heal is healing");
});
//dikha kya??
//haa
