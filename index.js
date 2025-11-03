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

    app.post('/products', async(req, res)=>{
        const newProducts = req.body;
        const result = await productsCollection.insertOne(newProducts)
        res.send(result);
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
      const result = await productsCollection.deleteOne(query);
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
