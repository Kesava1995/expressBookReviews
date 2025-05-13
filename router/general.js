const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Check if a user with the given username already exists
const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
  //Write your code here
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.send(JSON.stringify({ book: book }, null, 4));
    } else {
        res.status(404).send(JSON.stringify({ message: "Book not found" }, null, 4));
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
    const authorName = req.params.author;
    const matchingBooks = [];

    // Get all ISBNs (keys of the books object)
    const isbns = Object.keys(books);

    // Iterate through all books and check for matching author
    for (let isbn of isbns) {
        const book = books[isbn];
        if (book.author.toLowerCase() === authorName.toLowerCase()) {
            matchingBooks.push({ isbn: isbn, ...book });
        }
    }

    if (matchingBooks.length > 0) {
        res.send(JSON.stringify({ books: matchingBooks }, null, 4));
    } else {
        res.status(404).send(JSON.stringify({ message: "No books found by this author" }, null, 4));
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
    const titleName = req.params.title;
    const matchingBooks = [];

    // Get all ISBNs (keys of the books object)
    const isbns = Object.keys(books);

    // Iterate through all books and check for matching titles
    for (let isbn of isbns) {
        const book = books[isbn];
        if (book.title.toLowerCase() === titleName.toLowerCase()) {
            matchingBooks.push({ isbn: isbn, ...book });
        }
    }

    if (matchingBooks.length > 0) {
        res.send(JSON.stringify({ books: matchingBooks }, null, 4));
    } else {
        res.status(404).send(JSON.stringify({ message: "No books found by this title" }, null, 4));
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.send(JSON.stringify({ reviews: book.reviews }, null, 4));
    } else {
        res.status(404).send(JSON.stringify({ message: "Book not found" }, null, 4));
	}
});


// Task 10: Get all books using async/await
public_users.get('/async/books', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/');
        return res.status(200).send(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error.message });
    }
});


// Task 11: Get book details by ISBN using Promise
public_users.get('/async/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then((response) => {
            res.status(200).send(response.data);
        })
        .catch((error) => {
            res.status(404).json({ message: "Book not found", error: error.message });
        });
});

// Task 12: Get books by author using async/await
public_users.get('/async/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        res.status(200).send(response.data);
    } catch (error) {
        res.status(404).json({ message: "Author not found", error: error.message });
    }
});


// Task 13: Get books by title using Promise
public_users.get('/async/title/:title', (req, res) => {
    const title = req.params.title;
    axios.get(`http://localhost:5000/title/${title}`)
        .then((response) => {
            res.status(200).send(response.data);
        })
        .catch((error) => {
            res.status(404).json({ message: "Title not found", error: error.message });
        });
});

module.exports.general = public_users;
