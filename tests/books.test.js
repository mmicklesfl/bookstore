const request = require('supertest');
const app = require('../app'); 
const db = require('../db'); 
require('dotenv').config({ path: '../.env.test' });

beforeAll(async () => {
    process.env.PG_DATABASE = 'books-test'; 
    console.log("Current NODE_ENV:", process.env.NODE_ENV); // for debugging
      try {
          const dbResponse = await db.query("SELECT current_database()");
          console.log("Connected to database:", dbResponse.rows[0].current_database);
      } catch (err) {
          console.error("Database connection error:", err);
      }
  });

afterAll(async () => {
    await db.end();
});

describe('GET /books', () => {
    test('should return list of books', async () => {
        const response = await request(app).get('/books');
        expect(response.status).toBe(200);
        expect(response.body.books).toBeDefined();
    });
});

describe('POST /books', () => {
    test('should create a new book', async () => {
        const newBook = {
            isbn: "1234567890",
            amazon_url: "http://example.com",
            author: "John Doe",
            language: "english",
            pages: 200,
            publisher: "Publisher XYZ",
            title: "Test Book",
            year: 2022
        };

        const response = await request(app)
            .post('/books')
            .send(newBook);

        expect(response.status).toBe(201);
        expect(response.body.book).toBeDefined();
    });

    test('should return 400 for invalid input', async () => {
        const invalidBookData = {
            // Missing required field "title"
            author: "John Doe",
            language: "english",
            pages: 200,
            publisher: "Publisher XYZ",
            year: 2022
        };

        const response = await request(app)
            .post('/books')
            .send(invalidBookData);

        expect(response.status).toBe(400);
    });
});

describe('GET /books/:id', () => {
    test('should return a single book', async () => {
        const response = await request(app).get('/books/1234567890');
        expect(response.status).toBe(200);
        expect(response.body.book).toBeDefined();
    });

    test('should return 404 for non-existent book', async () => {
        const response = await request(app).get('/books/987654321');
        expect(response.status).toBe(404);
    });
});

describe('PUT /books/:isbn', () => {
    test('should update an existing book', async () => {
        const updatedBookData = {
            title: "Updated Title",
            author: "Updated Author",
        };

        const response = await request(app)
            .put('/books/1234567890') 
            .send(updatedBookData);

        expect(response.status).toBe(200);
        expect(response.body.book).toBeDefined();
    });

    test('should return 404 for non-existent book', async () => {
        const updatedBookData = {
            title: "Updated Title",
            author: "Updated Author",
        };

        const response = await request(app)
            .put('/books/non-existent-isbn')
            .send(updatedBookData);

        expect(response.status).toBe(404);
    });

});

describe('DELETE /books/:isbn', () => {
    test('should delete an existing book', async () => {
        const response = await request(app).delete('/books/1234567890'); 
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Book deleted');
    });

    test('should return 404 for non-existent book', async () => {
        const response = await request(app).delete('/books/non-existent-isbn');
        expect(response.status).toBe(404);
    });
});
