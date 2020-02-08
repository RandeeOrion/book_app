'use strict';
require('dotenv').config();

const PORT = process.env.PORT;

const superagent = require('superagent');
const express = require('express');
const app = express();


app.use(express.static('./public'));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', renderHomePage);
app.get('/searches/new', showForm);
app.post('/searches', createSearch);


function renderHomePage(request, response) {
  response.render('pages/index');
}



function showForm(request, response) {
  const hello = 'hello world';
  response.render('pages/searches/new', {bye: hello});
}


app.get('*', (request, response) => response.status(404).send('This route does not exist'));





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
      console.log(bookArray);
      response.render('pages/searches/show', {books: bookArray});
    });
}


app.post('/save', (req, res) => {
  console.log(req.query);
  console.log(req.body);
  res.status(200).send('You did a POST');
});


app.listen(process.env.PORT, () => console.log(`up on ${process.env.PORT}`));
