const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
// This function is for registration, not login. We can leave it for now.
}

// This function checks if the username and password match a record in our 'users' array.
const authenticatedUser = (username,password)=>{
  // Filter the users array to find any user with matching username and password.
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  // If the filtered array has one or more users, it means the credentials are valid.
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username and password were provided.
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in. Username or password not provided."});
  }

  // Check if the user is authenticated.
  if (authenticatedUser(username,password)) {
    // If authenticated, create a JWT.
    // The payload contains user data. The secret 'access' must match the one in index.js.
    let accessToken = jwt.sign({
      data: password // or username, just some payload
    }, 'access', { expiresIn: 60 * 60 }); // Expires in 1 hour

    // Save the token and username in the session for later use.
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("User successfully logged in");
  } else {
    // If authentication fails, send an error message.
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization?.username;
  
    if (!username) {
      return res.status(401).json({ message: "User not logged in." });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book with the specified ISBN not found." });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Review not provided in the query." });
    }
  
    // Add or update the review
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({
      message: "Review successfully added/updated.",
      review: books[isbn].reviews
    });
  });

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;
  
    if (!username) {
      return res.status(403).json({ message: "User not authenticated." });
    }
  
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    const book = books[isbn];
  
    if (book.reviews && book.reviews[username]) {
      delete book.reviews[username];
      return res.status(200).json({ message: "Review successfully deleted." });
    } else {
      return res.status(404).json({ message: "No review found for this user on the given ISBN." });
    }
  });  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;