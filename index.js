const express = require('express')
const cors = require('cors')
const app = express()
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000 ;


// middle ware 
app.use(cors())
app.use(express.json())
require('dotenv').config()






const uri = `mongodb+srv://${process.env.COMPUTER}:${process.env.PASSWORD}@cluster0.mdunt9i.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const categoriesCollection = client.db('assignment12').collection('categories')
        app.get('/categoires',async (req,res)=>{
            const query = {};
            const cursor = categoriesCollection.find(query)
            const gategories = await cursor.toArray()
            res.send(gategories)
        })
    }
    finally{

    }
}
run().catch(error => console.error(error))

// listener use for see server running in console 
app.get('/', (req, res) => res.send('Hello World!'))
app.listen(port, ()=> {
    console.log(`computer reseller server running on ${port}`)
})