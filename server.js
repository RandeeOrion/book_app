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
  this.description = data.description,
  this.isbn = data.industryIdentifiers || 'NA',
  this.image = data.imageLinks.smallThumbnail || 'NA';
}


function createSearch(req, response){
  console.log('inside createSearch');
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  console.log('req body', req.body);
  console.log('req body,search', req.body.search);

  if(req.body.title) {url +=`intitle:${req.body.search}`;}
  if(req.body.author) {url +=`inauthor:${req.body.search}`;}
  console.log(url);
  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo))
    );

}



app.post('/save', (req, res) => {
  console.log(req.query);
  console.log(req.body);
  res.status(200).send('You did a POST');
});


app.listen(process.env.PORT, () => console.log(`up on ${process.env.PORT}`));
