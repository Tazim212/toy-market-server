const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require('cors')
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// const corsConfig = {
//   origin: 'https://toy-market-app.web.app/',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE']
// }
app.use(cors())
// app.options("", cors(corsConfig))
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tbmejyb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const toyCollection = client.db("toyDB").collection("toyData");
    const insertingToy = client.db("toyDB").collection("addededToys");

    app.get("/toys", async (req, res) => {
      const toys = toyCollection.find();
      const result = await toys.toArray();
      res.send(result);
    });

    app.post("/addtoys", async (req, res) => {
      const doc = req.body;
      const result = await insertingToy.insertOne(doc);
      res.send(result);
    });

    app.get("/addtoys", async (req, res) => {
     const { sort } = req.query;
     const options = {};
     if(sort){
       options['price'] = sort === 'asc' ? 1 : -1;
     }
     console.log(options)
      const cursor = insertingToy.find({}).sort(options);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/addtoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await insertingToy.deleteOne(query);
      res.send(result);
    });

    app.put("/updatetoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          price: req.body.price,
          quantity: req.body.quantity,
          description: req.body.description
        },
      };
      const result = await insertingToy.updateOne(query, updateDoc);
      res.send(result);
    });

    app.get("/alltoys", async (req, res) => {
      const allToys = insertingToy.find().limit(20);
      const result = await allToys.toArray();
      res.send(result);
    });
    app.get("/singletoy/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: new ObjectId(id) };
      const options = {
        projection: {
          name: 1,
          sellerName: 1,
          price: 1,
          rating: 1,
          quantity: 1,
          email: 1,
          description: 1,
        },
      };
      const result = await insertingToy.findOne(cursor, options).toArray;
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("i am here");
});
app.listen(port, () => {
  console.log(`The port is running on: ${port}`);
});
