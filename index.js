const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

var bodyParser = require('body-parser');
// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectId } = require('mongodb');
const url = process.env.password;

const port = 3000;

MongoClient.connect(url)
.then(db => {
console.log("Database connected!");
db.close();
})
.catch(err => {
throw err;
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'images')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('homepage');
})

app.get('/add', (req, res) => {
    res.render('add_article');
})
app.get('/add_article', (req, res) => {
    res.render('add_article');
})
app.get('/homepage', (req, res) => {
    res.render('homepage');
})

app.post('/add', (req, res) => {

    MongoClient.connect(url)
    .then(db => {
        var dbo = db.db("article-website");
        console.log(req.body);
        dbo.collection("articles").insertOne(req.body)
        .then(data => {
            console.log("Inserted data: ",data);
            db.close();
            res.redirect('/all_article')
        })
        .catch(err => {
            console.log("An error occurred:", err);
        })
        .catch(err => {
            console.log("An error occurred in connecting Database", err);
        })
    })
});

app.get('/all_article', (req, res) => {
    MongoClient.connect(url)
        .then(client => {
            const db = client.db("article-website");
            const articlesCollection = db.collection("articles");

            return articlesCollection.find({}).toArray()
                .then(articles => {
                    res.render('all_article', { articles: articles });
                })
                .catch(err => {
                    console.error("Error fetching articles:", err);
                    res.status(500).send("Error fetching articles");
                })
                .finally(() => {
                    client.close();
                });
        })
        .catch(err => {
            console.error("Error connecting to MongoDB:", err);
            res.status(500).send("Error connecting to database");
        });
});

app.delete('/articles/:id', async (req, res) => {
    try {
      const articleId = req.params.id;
      const client = await MongoClient.connect(url);
      const db = client.db("article-website");
      const articlesCollection = db.collection("articles");
  
      const result = await articlesCollection.deleteOne({ _id: new ObjectId(articleId) });
  
      if (result.deletedCount === 1) {
        console.log("Deleted article successfully");
        res.status(200).send({ message: "Article deleted successfully" });
        client.close();
      } else {
        console.log("No article found to delete");
        res.status(404).send({ message: "Article not found" });
      }
    } catch (err) {
      console.error("An error occurred while deleting article:", err);
      res.status(500).send({ message: "An error occurred while deleting the article" });
      client?.close?.();
    }
  });



app.listen(port, ()=> {
    console.log("Server started on port",port);
});