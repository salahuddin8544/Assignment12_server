const express = require('express')
const cors = require('cors')
require('dotenv').config()
const app = express()
const { query } = require('express');


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// require for json web token
const jwt = require('jsonwebtoken');

const port = process.env.PORT || 5000 ;
const stripe = require("stripe")('sk_test_51M8QKgDkkfkXeQg4QD21Oyg7MqslreAwa3Xq5RFcDVTHc0BCsjZYkioAoK87njhL4YweSU5FXhMGArijIwV4tSaW00hCxpH494');

// middle ware 
app.use(cors())
app.use(express.json())

// verify user token 
function verifyJWT(req,res,next) {
    const authHeader = req.headers.authorization ;
    console.log(authHeader);
    if(!authHeader){
         return  res.send(401).send('unauthorized access')

    }
    const token = authHeader.split(' ')[1]
    // jwt verify  call for verify client req token 
    console.log('token find ',token)
    jwt.verify(token, process.env.ACCESS_TOKEN , function(err , decoded) {
        // if an error occurd , then send the 403 status 
        if(err) {
            return res.status(403).send({message:'forbidden access'})
        }
        //  if not an error occurd doing work 
        req.decoded = decoded ;

        // next must be call for going to next step after verify 
        next();
        
    })
}

const uri = `mongodb+srv://${process.env.COMPUTER}:${process.env.PASSWORD}@cluster0.mdunt9i.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const categoriesCollection = client.db('assignment12').collection('categories')
        const productsCollection = client.db('assignment12').collection('products')
        const buyerBookingsCollection = client.db('assignment12').collection('bookings')
        const usersCollection = client.db('assignment12').collection('users')
        const reportsCollection = client.db('assignment12').collection('reports')









        // ------------user verify and save user and get user---------------//
   // if user? db? , get user information by jwt from db 
   app.get('/jwt', async(req,res)=> {
    const email = req.query.email;
    const query = {email:email};
    const user = await usersCollection.findOne(query);
    // if get user , give a token 
    if(user){
        const token = jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn:'2h'})
   
        return res.send({accessToken:token})
    }
    // if user not found from db send the status 
    // res.status(403).send({accessToken:'Not found '})
   })

console.log('TOKEN',process.env.ACCESS_TOKEN);

// check user isAdmin ,if user.role not admin ? .. he will not access go to admin dashbord url
app.get('/users/admin/:email', async(req,res)=> {
    const email = req.params.email;
    const query = {email}
    const user = await usersCollection.findOne(query);
    res.send({isAdmin: user?.role === "admin"})
   } )


 // update user by specific id and make admin  .....
 app.put('/users/admin/:id',verifyJWT, async(req,res)=> {
    // load user from db and check role admin have or haven't
    const decodedEmail = req.decoded.email;
    const query = {email:decodedEmail};
    const user = await usersCollection.findOne(query);
    if(user.role !== "admin" ){
        return res.status(403).send({message:'forbidden access '})
    } 
    const id = req.params.id ;
    const filter = {_id:ObjectId(id)};
    const options = {upsert:true};
    const updateDoc = {
        $set:{
            role:'admin'
        },
    };
    const result = await usersCollection.updateOne(filter,updateDoc,options);
    res.send(result)
 })




// check usertype :if userType === seller ? he will able to adde a products 
app.get('/users/seller/:email', async(req,res)=> {
    const email = req.params.email;
    const query = {email}
    const user = await usersCollection.findOne(query);
    res.send({isSeller:user?.role  })
})





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
                const email = req.query.email
                const query = {email:email}
                const cursor = await buyerBookingsCollection.find(query).toArray()
                res.send(cursor)
            })




            // post usrers  data in db

            app.post('/users', async(req,res)=>{
                const users = req.body
                console.log(users);
                const result = await usersCollection.insertOne(users)
                res.send(result)
            })
            // post new added product from clint site  data in db

            app.post('/products', async(req,res)=>{
                const addedProduct = req.body
                console.log(addedProduct);
                const result = await productsCollection.insertOne(addedProduct)
                res.send(result)
            })

            // find all products form db

            app.get('/products', async (req,res)=>{
                const query = {};
                const cursor = productsCollection.find(query)
                const reports = await cursor.toArray()
                res.send(reports)
            })



            
            // post repots  data in db

            app.post('/reports', async(req,res)=>{
                const report = req.body
                console.log(report);
                const result = await reportsCollection.insertOne(report)
                res.send(result)
            })
            //get users data from mongodb
            app.get('/reports', async (req,res)=>{
                const query = {};
                const cursor = reportsCollection.find(query)
                const reports = await cursor.toArray()
                res.send(reports)
            })


            //get users data from mongodb
            app.get('/users', async (req,res)=>{
                const query = {};
                const cursor = usersCollection.find(query)
                const users = await cursor.toArray()
                res.send(users)
            })


            // bookings id data loaded
            app.get('/bookings/:id', async (req,res)=>{
                const id = req.params.id;
                const query = {_id:ObjectId(id)};
                const booking = await buyerBookingsCollection.findOne(query)
                res.send(booking)
            })

            // payment card 
            app.post("/create-payment-intent", async (req,res)=>{
                const booking = req.body;
                const Price = booking.Price;
                const amount = parseInt(Price) * 100;
                const paymentIntent = await stripe.paymentIntents.create({
                    currency:'usd',
                    amount: amount,
                    "payment_method_types":[
                        'card'
                    ]
                })
                res.send({
                    clientSecret: paymentIntent.client_secret,
                  });
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