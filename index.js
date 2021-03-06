const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_ID}:${process.env.USER_PASS}@cluster0.ols3g.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('woodmart');
        const products = database.collection('products');
        const users = database.collection('users');
        const orders = database.collection('orders');
        const reviews = database.collection('reviews');

        // rendering for home
        app.get('/home', async (req, res) => {
            const cursor = products.find({}).limit(6);
            const homeProducts = await cursor.toArray();
            res.json(homeProducts);
        });

        // get all products
        app.get('/explore', async (req, res) => {
            const allProducts = await products.find({}).toArray();
            res.json(allProducts);
        });

        // single product rendering
        app.get('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await products.findOne(query);
            res.json(product);
        });

        // get all orders
        app.get('/order', async (req, res) => {
            const allOrders = await orders.find({}).toArray();
            res.json(allOrders);
        });

        // my orders rendering by email
        app.get('/myOrder', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const result = await orders.find(query).toArray();
            res.json(result);
        })

        // get all reviews
        app.get('/review', async (req, res) => {
            const result = await reviews.find({}).toArray();
            res.json(result);
        });

        // check admin
        app.get('/users', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await users.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // all products added in database
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await products.insertOne(product);
            res.json(result);
        });

        // users added in database
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await users.insertOne(user);
        });

        // order added in database
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orders.insertOne(order);
            res.json(result);
        });

        // review added in database
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviews.insertOne(review);
            res.json(result);
        });

        // delivery status update
        app.put('/status/:id', async (req, res) => {
            const id = req.params.id;
            const updateStatus = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updateStatus.status
                },
            };
            const result = await orders.updateOne(query, updateDoc, options);
            res.json(result);
        })
        // make an admin
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            };
            const result = await users.updateOne(filter, updateDoc);
            res.json(result);
        });

        // delete a particular order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orders.deleteOne(query);
            res.json(result);
        });

        // delete a particular product
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await products.deleteOne(query);
            res.json(result);
        });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Woodmart server is running');
})

app.listen(port, () => {
    console.log(`listening at port ${port}`);
})