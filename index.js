require("dotenv").config();


const express= require("express");
const mongoose= require("mongoose");
var bodyParser=require("body-parser");


// Database
const database = require("./database/database");


// Models
const BookModel = require("./database/book");
const AuthorModel = require("./database/author");
const PublicationModel = require("./database/publication");


// Initialize express
const booky=express();

booky.use(bodyParser.urlencoded({extended:true}));
booky.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URL,
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
}
).then(() => console.log("Connection Established"));

/*
Route            /
Description      Get all the books
Access           PUBLIC
Parameter        NONE
Methods          GET
*/


booky.get("/",async (req,res) =>{
  const getAllBooks= await BookModel.find();
  return res.json(getAllBooks);
});

/*
Route            /is
Description      Get specific book on ISBN
Access           PUBLIC
Parameter        isbn
Methods          GET
*/
booky.get("/is/:isbn",async(req,res) =>{
const getSpecificBook= await BookModel.findOne({ISBN : req.params.isbn});

// null !1=0 and !0=1
  if(!getSpecificBook){
    return res.json({error:`No book found for the ISBN of ${req.params.isbn}`});
  }

  return res.json({book:getSpecificBook});
});

/*
Route            /c
Description      Get specific book on category
Access           PUBLIC
Parameter        category
Methods          GET
*/
booky.get("/c/:category",async (req,res) =>{
  const getSpecificBook= await BookModel.findOne({category : req.params.category});

  // null !1=0 and !0=1
    if(!getSpecificBook){
      return res.json({error:`No book found for the category of ${req.params.category}`});
    }

    return res.json({book:getSpecificBook});

});

/*
Route            /l
Description      Get specific book on languages
Access           PUBLIC
Parameter        language
Methods          GET
*/
booky.get("/l/:language",(req,res) =>{
  const getSpecificBook=database.books.filter(
    (book) => book.language.includes(req.params.language)
  );

  if (getSpecificBook.length===0){
    return res.json({error:`No book found for the language of ${req.params.language}`});
  }

  return res.json({book:getSpecificBook});
});



/*
Route            /author
Description      Get all author
Access           PUBLIC
Parameter        NONE
Methods          GET
*/
booky.get("/author",async (req,res) =>{
  const getAllAuthors= await AuthorModel.find();
  return res.json(getAllAuthors);
});

/*
Route            /author/book
Description      Get all author based on books
Access           PUBLIC
Parameter        isbn
Methods          GET
*/
booky.get("/author/book/:isbn", (req,res) => {
  const getSpecificAuthor = database.author.filter(
    (author) => author.books.includes(req.params.isbn)
  );

  if(getSpecificAuthor.length === 0){
    return res.json({
      error: `No author found for the book of ${req.params.isbn}`
    });
  }
  return res.json({authors: getSpecificAuthor});
});

/*
Route         /author/id
Description   Get specific author based on ID
Access        Public
Parameters    id
Methods       GET
*/
booky.get("/author/id/:id", (req, res) => {
  const getSpecificAuthor = database.author.filter((author) => author.id === parseInt(req.params.id));
  if (getSpecificAuthor.length === 0)
    return res.json({
      ERROR: `No author found for the id of ${req.params.id}`
    });
  else {
    return res.json({
      author: getSpecificAuthor
    });
  }
});



/*
Route            /publications
Description      Get all publications
Access           PUBLIC
Parameter        NONE
Methods          GET
*/
booky.get("/publications", async(req,res) => {
  const getAllPublications= await PublicationModel.find();
  return res.json(getAllPublications);
});

/*
Route         /publications
Description   Get the specific publication
Access        Public
Parameter     name
Methods       GET
*/
booky.get("/publications/:name",(req,res) =>{
  const getSpecificPublication = database.publication.filter(
    (publication) => publication.name.includes(req.params.name)
  );
  if(getSpecificPublication.length === 0) {
    return res.json({error: `No publication found for the book of ${req.params.name}`});
  }
  return res.json({publications: getSpecificPublication});
});

/*
Route            /publications/book
Description      Get publications based on books
Access           PUBLIC
Parameter        isbn
Methods          GET
*/
booky.get("/publications/book/:isbn",(req,res) =>{
  const getSpecificPublication = database.publication.filter(
    (publication) => publication.books.includes(req.params.isbn)
  );

  if(getSpecificPublication.length === 0){
    return res.json({
      error: `No publication found for the book of ${req.params.isbn}`
    });
  }
  return res.json({publications: getSpecificPublication});
});


// POST
/*
Route            /book/new
Description      Add new Books
Access           PUBLIC
Parameter        NONE
Methods          POST
*/
booky.post("/book/new", async(req,res) =>{
  const { newBook } =req.body;
  const addNewBook =BookModel.create(newBook);
  return res.json(
    {
      books: addNewBook,
      message: "Book was Added !!!"});
});
/*
Route            /author/new
Description      Add new Author
Access           PUBLIC
Parameter        NONE
Methods          POST
*/
booky.post("/author/new",(req,res)=>{
  const { newAuthor } =req.body;
  const addNewAuthor =AuthorModel.create(newAuthor);
  return res.json(
    {
      author: addNewAuthor,
      message: "Author was Added !!!"});
});
/*
Route            /publication/new
Description      Add new Publication
Access           PUBLIC
Parameter        NONE
Methods          POST
*/
booky.post("/publication/new",(req,res)=>{
  const newPublication=req.body;
  database.publication.push(newPublication);
  return res.json({updatedBooks:database.publication});

});

/************PUT*************************/
/***PUT***/
/*
Route            /book/update
Description      Update book on isbn
Access           PUBLIC
Parameter        isbn
Methods          PUT
*/
booky.put("/book/update/:isbn",async (req,res) =>{
  const updatedBook = await BookModel.findOneAndUpdate({
    ISBN:req.params.isbn
  },
  {
    title:req.body.bookTitle
  },
  {
    new:true
  }
);
  return res.json({
    books:updatedBook
  });
});



/**********Updating new author*************/
/*
Route            /book/author/update/
Description      Update or add new author
Access           PUBLIC
Parameter        isbn
Methods          PUT
*/


booky.put("/book/author/update/:isbn",async (req,res) =>{
  // Update book database
    const updatedBook = await BookModel.findOneAndUpdate(
      {
      ISBN:req.params.isbn
    },
    {
      $addToSet:{
        authors :req.body.newAuthor
      }
    },
    {
      new:true
    }
  );

  // Update author database
  const updatedAuthor = await AuthorModel.findOneAndUpdate(
    {
    id:req.body.newAuthor
  },
  {
    $addToSet:{
      ISBN:req.params.isbn
    }
  },
  {
    new : true
  }
);
  return res.json({
    books:updatedBook,
    authors:updatedAuthor,
    message:"New author was added"});
});















/***PUT***/
/*
Route            /publication/update/book/
Description      Update or add new publication
Access           PUBLIC
Parameter        isbn
Methods          PUT
*/
booky.put("/publication/update/book/:isbn",(req,res) =>{
    // Update the publication Database
    database.publication.forEach((pub) =>{
      if(pub.id===req.body.pubID){
        return pub.books.push(req.params.isbn);
      }
    });

    // Update the book Database
    database.books.forEach((book) => {
      if(book.ISBN===req.params.isbn){
        book.publications = req.body.pubID;
        return;
      }
    });

      return res.json(
        {
          books:database.books,
          publications:database.publication,
          message:"Succesfully updated publications"
        }
      );
    });


/****DELETE*******/
/*
Route            /book/delete/
Description      Delete a book
Access           PUBLIC
Parameter        isbn
Methods          DELETE
*/

booky.delete("/book/delete/:isbn", async(req,res)=>{
  // whichever book that does not match with the isbn,just send it to an updated database array
  // rest will be filtered out
  const updatedBookDatabase = await BookModel.findOneAndDelete({
    ISBN:req.params.isbn
  });
  return res.json({
    books:updatedBookDatabase
  });
});



/*
Route            book/delete/author/
Description      Delete author from book and related book from author
Access           PUBLIC
Parameter        isbn,authorId
Methods          DELETE
*/
booky.delete("/book/delete/author/:isbn/:authorId",(req,res)=>{
  // Update the book database
  database.books.forEach((book) =>{
    if(book.ISBN===req.params.isbn){
        const newAuthorList = book.author.filter(
          (eachAuthor)=>eachAuthor !== parseInt(req.params.authorId)
        );
        book.author = newAuthorList;
        return;
    }
  });


  // Update the author database
  database.books.forEach((eachAuthor) =>{
    if(eachAuthor.id===parseInt(req.params.authorId)){
      const newBookList = eachAuthor.author.filter(
        (book)=>book !== req.params.isbn
      );
      eachAuthor.books=newBookList;
      return;
    }
  });
  return res.json({
    book:database.books,
    author:database.author,
    message:"Author was deleted!!!!"
  });

});





booky.listen(3000,() =>{
  console.log("Server is up and running");
});
