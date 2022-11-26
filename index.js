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
        const productsCollection = client.db('assignment12').collection('products')
        const buyerBookingsCollection = client.db('assignment12').collection('bookings')
        const usersCollection = client.db('assignment12').collection('users')

        //get categories
        app.get('/categoires',async (req,res)=>{
            const query = {};
            const cursor = categoriesCollection.find(query)
            const gategories = await cursor.toArray()
            res.send(gategories)
        })
        // all categories data
        app.get('/categoires/:id', async (req,res)=>{
            const id = req.params.id;
            const query = {category_id:id}
            const result = await productsCollection.find(query).toArray()
            res.send(result)
        })

        // post bookings buyer booking data in db

            app.post('/bookings', async(req,res)=>{
                const buyerBooking = req.body
                console.log(buyerBooking);
                const result = await buyerBookingsCollection.insertOne(buyerBooking)
                res.send(result)
            })

            //get bookings buyer bookin data from mongodb
            app.get('/bookings', async (req,res)=>{
                const query = {};
                const cursor = buyerBookingsCollection.find(query)
                const buyerBookings = await cursor.toArray()
                res.send(buyerBookings)
            })




            // post usrers  data in db

            app.post('/users', async(req,res)=>{
                const users = req.body
                console.log(users);
                const result = await usersCollection.insertOne(users)
                res.send(result)
            })
            //get users data from mongodb
            app.get('/users', async (req,res)=>{
                const query = {};
                const cursor = usersCollection.find(query)
                const users = await cursor.toArray()
                res.send(users)
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