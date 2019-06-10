var express          = require("express"),
    app              = express(),
    mongoose         = require("mongoose"),
    bodyParser       = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride   = require('method-override');

// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodOverride("_method"));

// MONGOOSE MODEL CONFIG
var blogSchema = new mongoose.Schema({
    title: String,
    body: String,
    image: String,
    created:  {type: Date, default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "Test Blog",
//     image: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=960&q=80",
//     body: "This is a blog poste!"
// });

// RESTFULL ROUTES
app.get("/", function(req, res){
   res.redirect("/blogs"); 
});

// INDEX ROUTS
app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log("ERROR!");
        }else {
           res.render("index", {blogs: blogs}); 
        }
    })
});

// NEW ROUT
app.get("/blogs/new", function(req, res){
    res.render("new");
});

//CREATE ROUT
app.post("/blogs", function(req, res){
   // create blog
//   console.log(req.body);
   req.body.blog.body = req.sanitize(req.body.blog.body);
//   console.log("=============");
//   console.log(req.body);
   Blog.create(req.body.blog, function(err, newBlog){
       if(err){
           res.render("new");
       } else {
           // then, redirect
           res.redirect("/blogs");
       }
   });
});


// Show ROUTE
app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, foundBlog){ 
      if(err){
          res.redirect("/blogs");
      } else{
          res.render("show", {blog: foundBlog});
      }
   }); 
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

// UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
       if(err){
           res.redirect("/blogs");
       } else{
           res.redirect("/blogs/" + req.params.id);
       }
    });
});

// DESTROY ROUTE
app.delete("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, blog){
       if(err){
           console.log(err);
       } else {
           blog.remove();
           res.redirect("/blogs");
       }
   }); 
});

app.listen(process.env.PORT, process.env.IP, function(){
   console.log("SERVER IS RUNNING!") 
});