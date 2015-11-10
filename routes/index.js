var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

// get the list of posts from the db
router.get('/posts', function(req, res, next) {
  Post.find(function(err, posts) {
    if(err) return next(err);
    
    res.json(posts);
  });
});

// add a new post to the db
router.post('/posts', function(req, res, next) {
  var post = new Post(req.body);
  
  post.save(function(err, post) {
    if(err) return next(err);
    
    res.json(post);
  });
});

// this is used in multiple places to get a specific post based on id
// this will be called whenever we have a route with :post, then it will
// go into that route
router.param('post', function(req, res, next, id) {
  var query = Post.findById(id);
  
  query.exec(function(err, post) {
    if(err) { return next(err); }
    if(!post) {return next(new Error('can\'t find post')); }
    
    req.post = post;
    return next();
  });
});

// this was actually handled by the middleware (that param function above)
// so all we have to do here is attach the post json to the result
router.get('/posts/:post', function(req, res) {
  req.post.populate('comments', function(err, post) {
    if(err) return next(err);
    
    res.json(req.post);
  });
});

router.put('/posts/:post/upvote', function(req, res, next) {
  req.post.upvote(function(err, post) {
    if(err) return next(err);
    
    res.json(post);
  });
});

router.post('/posts/:post/comments', function(req, res, next) {
  var comment = new Comment(req.body);
  comment.post = req.post;
  
  comment.save(function(err, comment) {
    if(err) return next(err);
    
    req.post.comments.push(comment);
    req.post.save(function(err, post) {
      if(err) return next(err);
      
      res.json(comment);
    });
  });
});

// this is used in multiple places to get a specific post based on id
router.param('comment', function(req, res, next, id) {
  var query = Comment.findById(id);
  
  query.exec(function(err, comment) {
    if(err) { return next(err); }
    if(!comment) return next(new Error('can\'t find comment')); 
    
    req.comment = comment;
    return next();
  });
});

router.put('/posts/:post/comments/:comment/upvote', function(req, res, next) {
  req.comment.upvote(function(err, comment) {
    if(err) return next(err);
    
    res.json(comment);
  })
});

module.exports = router;
