const request = require('supertest');
const app = require('../app');
const db = require('../db');
const Book = require("../models/book");
require('dotenv').config({ path: '../.env.test' });

beforeAll(async () => {
    process.env.PG_DATABASE = 'books-test';
    console.log("Using database:", process.env.PG_DATABASE); // for debugging
    console.log("Current NODE_ENV:", process.env.NODE_ENV); // for debugging

    await db.query(`
        CREATE TABLE IF NOT EXISTS books (
            isbn TEXT PRIMARY KEY,
            amazon_url TEXT,
            author TEXT,
            language TEXT, 
            pages INTEGER,
            publisher TEXT,
            title TEXT, 
            year INTEGER
        );
    `);
});

afterEach(async () => {
    await db.query('DELETE FROM books');
});

afterAll(async () => {
    await db.end();
});

describe("Book.update", () => {
    const sampleBook = {
        isbn: "123456789",
        title: "Original Title",
        author: "Original Author",
        language: "English",
        pages: 300,
        publisher: "Original Publisher",
        year: 2020
    };

    beforeEach(async () => {
        // Insert sample book before each test
        await db.query(
            `INSERT INTO books (isbn, title, author, language, pages, publisher, year)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [sampleBook.isbn, sampleBook.title, sampleBook.author, sampleBook.language, sampleBook.pages, sampleBook.publisher, sampleBook.year]
        );
    });

    test("should update a book with only one field provided", async () => {
        const updateData = { title: "New Title" };
        const result = await Book.update(sampleBook.isbn, updateData);
        expect(result.title).toEqual(updateData.title);
        // Verify the update in the database
        const {rows} = await db.query('SELECT * FROM books WHERE isbn = $1', [sampleBook.isbn]);
        expect(rows[0].title).toEqual(updateData.title);
    });

    test("should update a book with multiple fields provided", async () => {
        const updateData = { title: "Updated Title", author: "Updated Author" };
        const result = await Book.update(sampleBook.isbn, updateData);
        expect(result.title).toEqual(updateData.title);
        expect(result.author).toEqual(updateData.author);
        // Verify the update in the database
        const {rows} = await db.query('SELECT * FROM books WHERE isbn = $1', [sampleBook.isbn]);
        expect(rows[0].title).toEqual(updateData.title);
        expect(rows[0].author).toEqual(updateData.author);
    });

    test("should throw an error if no valid fields are provided for update", async () => {
        const updateData = {}; // No fields provided
        await expect(Book.update(sampleBook.isbn, updateData)).rejects.toThrow("No valid fields provided for update");
    });

    test("should throw an error if the book does not exist", async () => {
      const nonExistentIsbn = "non-existent-isbn";
      const updateData = { title: "Updated Title" };
      await expect(Book.update(nonExistentIsbn, updateData)).rejects.toEqual({
          message: expect.stringContaining(`There is no book with an isbn '${nonExistentIsbn}`),
          status: 404
      });
    });
  });
