import express from 'express';
import cors from 'cors';
import mongoose from "mongoose";
import Pusher from "pusher";
import dbModel from './dbModels.js'


//app config
const app = express();

const PORT = process.env.PORT || 8080


const pusher = new Pusher({
  appId: '1078574',
  key: 'd79352588c07e1bb5c0d',
  secret: '3b0fc983e7dac621bead',
  cluster: 'us3',
  useTLS: true

});




const connection_url = 'mongodb+srv://insta_Clone:L1IQeoZu5AFhxyTx@cluster0.8m6yw.mongodb.net/<dbname>?retryWrites=true&w=majority'


mongoose.connect(connection_url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
})

mongoose.connection.once('open', ()=> {
    console.log("db connnected");
    const changeStream = mongoose.connection.collection('posts').watch();
    changeStream.on('change', (change) => {
        console.log("Change Triggered on pusher...");
        console.log(change)
        console.log('End of change');

        if(change.operationType === 'insert'){
            console.log('Triggering Pusher ')

            const postDetails = change.fullDocument;
            pusher.trigger('post', 'inserted', {
                username: postDetails.username,
                caption: postDetails.caption,
                imageUrl: postDetails.imageUrl
            })
        }
        else{
            console.log("unknown req  ")
        }
    })
})
//middlewares
app.use(express.json());
app.use(cors())

//db config

//api routes
app.get('/', (req, res) => res.status(200).send("hello world"));

app.post("/upload", (req, res) => {
    const body = req.body;
     dbModel.create(body, (err, data) => {
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(201).send(data);
        }
     })
});

app.get("/sync", (req, res) => {
    dbModel.find((err, data) => {
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(200).send(data);
        }
    })
})





//listen
app.listen(PORT, () => console.log(`listening on localhost: ${PORT}`))

