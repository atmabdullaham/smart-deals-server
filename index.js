const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.dbUser}:${process.env.dbPassword}@cluster0.a41jis3.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

async function run() {
  try {
    await client.connect();
    const db = client.db('smart_db');
    const productsCollection = db.collection('products')
    const bidsCollection = db.collection('bids')
    const usersCollection = db.collection('users')

    app.post("/users", async(req, res)=>{
      const newUser = req.body;
      const email = req.body.email;
      const query = {email: email}
      const existingUser = await usersCollection.findOne(query)
      if(!existingUser){
      const result = await usersCollection.insertOne(newUser);
      res.send(result)
      }      
      
    })

    app.post('/products', async(req, res)=>{
        const newProducts = req.body;
        const result = await productsCollection.insertOne(newProducts)
        res.send(result);
    })

    app.get('/latest-products', async(req, res)=>{
      const projectFields = { title: 1, price_min:1, price_max:1,image:1 };
      const cursor = productsCollection.find().project(projectFields).sort({created_at: -1}).limit(6)
      const result = await cursor.toArray()
      res.send(result)

    })

  // get all products 
 app.get("/products", async(req,res)=>{
  // const projectFields = {title:1, price_min:1, price_max:1, image:1}
  const email = (req.query.email);
  const query = {}
  if(email){
    query.email = email
  }
  const cursor = productsCollection.find(query)
  const result = await cursor.toArray()
  res.send(result)
})



//find single data 
app.get("/products/:id", async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await productsCollection.findOne(query)
  res.send(result)
})

    // update 
    app.patch('/products/:id', async(req, res)=>{
      const id = req.params.id;
      const updatedProducts = req.body;
      const query = {_id: new ObjectId(id)}
      const update ={
        $set: {
          title: updatedProducts.title,
          price_min: updatedProducts.price_min
        }
      }
      const result = await productsCollection.updateOne(query, update)
      res.send(result)
      
    })
    // delete operation
    app.delete('/products/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const cursor = bidsCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    
    // bids related api
    app.get('/bids', async(req, res)=>{
      const query = {};
      if(req.query.email){
        query.bidder_email = req.query.email
      }
      if(query.bidder_email){
        const result = await bidsCollection.find(query).toArray()
        res.send(result)
      }else{
        const result = await bidsCollection.find().toArray()
        res.send(result)
      }
    })
 
    app.post("/bids", async(req,res)=>{
      const newBid = req.body;
      // const bidder_email = newBid.bidder_email;
      // const query = {bidder_email:bidder_email};
      // const alreadyExists = await bidsCollection.findOne(query)
    
        const result = await bidsCollection.insertOne(newBid);
        res.send(result)

    })


app.get('/products/bids/:productId', async(req,res)=>{
  const product_id = req.params.productId;
  const query = {product_id: product_id};
  const result = await bidsCollection
  .find(query)
  .sort({bid_amount: -1})
  .map(bid => ({ ...bid, bid_amount: Number(bid.bid_amount) }))
  .toArray()
  res.send(result)

})

app.delete("/bids/:id", async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)}
  const result = await bidsCollection.deleteOne(query)
  res.send(result)
})
    


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
