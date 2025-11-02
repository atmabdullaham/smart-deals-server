const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
const port = 3000

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

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
