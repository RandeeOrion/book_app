'use strict';
require('dotenv').config();

const PORT = process.env.PORT;

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
const superagent = require('superagent');
const express = require('express');
const app = express();

client.connect();

app.use(express.static('./public'));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', renderHomePage);
app.get('/searches/new', showForm);
app.post('/searches/show', createSearch);
app.post('/books/detail', detailGoods);


function renderHomePage(request, response) {
  let SQL = `SELECT * FROM books`;
  client.query(SQL)
    .then( data => {
      console.log(data);
      response.render('pages/index.ejs', {databaseBooks: data.rows});
    })
    .catch ( () => {
      errorHandler('Things are broken. Head to your local bookstore to find a good book on how the internet works.', request, response);
    });
}



function showForm(request, response) {
  const hello = 'hello world';
  response.render('pages/searches/new', {bye: hello});
}


app.get('*', (request, response) => response.status(404).send('This route does not exist'));

//sending details from the book clicked on books/searches to database and to the details page
function detailGoods(request, response){
  let SQL = `INSERT INTO books (author, title, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
  let values = [request.body.authors, request.body.title, request.body.image, request.body.description, ' '];
  client.query(SQL, values)
    .then (response.render('pages/books/detail.ejs', {form: request.body}))
    .catch ( () => {
      errorHandler('Things are broken. Head to your local bookstore to find a good book on how the internet works.', request, response);
    });
}







function Book(data){
  this.title = data.title,
  this.authors = data.authors,
  this.description = data.description || 'description not available',
  //this.isbn = data.industryIdentifiers || 'NA',
  this.image = data.imageLinks.smallThumbnail || 'image not available';
}


function createSearch(req, response){
  let url= `https://www.googleapis.com/books/v1/volumes?q=in${req.body.searchField}:${req.body.search}`;

  superagent.get(url)
    .then(results => {
      const bookArray = (results.body.items.map(bookResult => new Book(bookResult.volumeInfo)));
      // console.log(bookArray);
      response.render('pages/searches/show', {books: bookArray});
    })
    .catch ( () => {
      errorHandler('Things are broken. Head to your local bookstore to find a good book on how the internet works.', request, response);
    });
}


function errorHandler(error, request, response) {
  response.status(500).send(error);
}


app.post('/save', (req, res) => {
  res.status(200).send('You did a POST');
});


app.listen(process.env.PORT, () => console.log(`up on ${process.env.PORT}`));
