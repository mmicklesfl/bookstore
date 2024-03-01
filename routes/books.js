const express = require("express");
const Book = require("../models/book");
const { validate } = require("jsonschema");
const createBookSchema = require("../schemas/createBookSchema");
const updateBookSchema = require("../schemas/updateBookSchema");

const router = new express.Router();

/** GET / => {books: [book, ...]}  */
router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err); 
  }
});

/** GET /[id]  => {book: book} */
router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    if (!book) {
      const notFoundError = new Error("Book not found");
      notFoundError.status = 404;
      throw notFoundError; 
    }
    return res.json({ book });
  } catch (err) {
    return next(err); 
  }
});

/** POST /   bookData => {book: newBook}  */
router.post("/", async function (req, res, next) {
  const validationResult = validate(req.body, createBookSchema);
  if (!validationResult.valid) {
    const validationError = new Error("Invalid input");
    validationError.status = 400;
    validationError.errors = validationResult.errors.map(error => error.stack);
    return next(validationError); 
  }
  try {
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err); 
  }
});

/** PUT /[isbn] bookData => {book: updatedBook} */
router.put("/:isbn", async function (req, res, next) {
  try {
    const book = await Book.update(req.params.isbn, req.body);
    if (!book) {
      const notFoundError = new Error("Book not found");
      notFoundError.status = 404;
      throw notFoundError; 
    }
    return res.json({ book });
  } catch (err) {
    return next(err); 
  }
});


/** DELETE /[isbn]   => {message: "Book deleted"} */
router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err); // Pass error to the next error handler
  }
});

module.exports = router;
