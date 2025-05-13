const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Function to check if the username is valid (i.e., not already taken)
const isValid = (username) => {
    return !users.some((user) => user.username === username);
}

// Function to check if username and password match
const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign(
            { data: username },  // safer to store username than password
            'access',
            { expiresIn: 60 * 60 } // 1 hour token expiry
        );

        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});
// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization?.username;

    // Check if ISBN exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if user is logged in
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    // Check if review text is provided
    if (!review) {
        return res.status(400).json({ message: "Review query is missing" });
    }

    // Add or update review
    books[isbn].reviews[username] = review;

    return res.status(200).json({ message: `Review successfully added/updated for book with ISBN ${isbn}` });
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username;

    // Check if ISBN exists
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if user is logged in
    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    // Check if review exists for the user
    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({ message: `Review deleted for book with ISBN ${isbn}` });
    } else {
        return res.status(404).json({ message: "Review not found for the logged-in user" });
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
