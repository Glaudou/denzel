const Express = require("express");
const BodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;
const imdb = require('./src/imdb');
const DENZEL_IMDB_ID = 'nm0000243';

const CONNECTION_URL = "mongodb+srv://Guig:lemotdepasse@denzel1-iszi4.mongodb.net/test?retryWrites=true";
const DATABASE_NAME = "Guig";

var app = Express();

app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: true }));

var database, collection;

app.listen(9292, () => {
    MongoClient.connect(CONNECTION_URL, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(DATABASE_NAME);
        collection = database.collection("Movies");
        console.log("Connected to `" + DATABASE_NAME + "`!");
    });

});

app.get("/Movies/populate", async(request, response) => {
  const movies = await imdb(actorsID.DENZEL_IMDB_ID);
    collection.insertMany(movies, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.get("/Movies", (request, response) => {
  collection.aggregate([
    {$match: {metascore: {$gte: 70}}},
    {$sample: {size: 1}}
  ]).toArray((error, result)=>{
    if(error) {
            return response.status(500).send(error);
        }
        response.send(result[0]);
    });
});

app.get("/Movies/:id", (request, response) => {
    collection.findOne({"_id": request.params.id}, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.get("/movies/search", (request, response) => {
	var limit = request.query.limit;
	var metascore = request.query.metascore;
	if(limit==null) {
		limit = 5;
	}
	if(metascore==null) {
		metascore = 0;
	}
    collection.aggregate([
		{$match: {metascore: {$gte: metascore}}},
		{$limit: limit},
		{$sort: {metascore: -1}}
	]).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});
