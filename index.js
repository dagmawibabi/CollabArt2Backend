let mongoose = require('mongoose');
let express = require('express');
let app = new express();
let cors = require('cors');
const { json } = require('express');
// let axios = require('axios');

//? Middleware
app.use(
    cors({
        origin: "*",
        credentials: false,
    })
);
// app.use(cors());

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// });

//? Server
let portNum = process.env.PORT || 5000;
let mongoAtlastUrl = process.env.DBURL;

app.listen(portNum, () => {
    console.log(`Server is running on port ${portNum}`);
});


//? Database
// Schema
let visitorsCount = new mongoose.Schema({
    ip: String,
    count: Number
})
let eachArtCount = new mongoose.Schema({
    artist: String,
    viewCount: Number,
    downloadCount: Number
})
let allResolutionDownloadCount = new mongoose.Schema({
    type: Number,
    count: Number
})

// Model
let visitorsCountModel = new mongoose.model('visitorsCounts', visitorsCount);
let eachArtCountModel = new mongoose.model('eachArtCounts', eachArtCount);
let allResolutionDownloadCountModel = new mongoose.model('allResolutionDownloadCounts', allResolutionDownloadCount);

// Connect to DB
async function connectToDB() {
    console.log("Connecting...");
    await mongoose.connect(mongoAtlastUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(console.log("MDBA Connected!") ).catch(err => console.log("ERROR"));
    console.log("connected!");
}      


//? Routes
// Intro
app.get("/tupm/", async (req, res) => {
    res.send("Welcome to The Unity Project Mural API");
})

// Add Visitors Count
app.get("/tupm/addVisitorsCount/", async (req, res) => {
    let ip = req.ip;
    let exists = await visitorsCountModel.find({ip: ip});
    if(exists.length > 0){
        await visitorsCountModel.updateOne({ip: ip}, {$inc: {count: 1}});
    } else {
        let data = {
            "ip": ip,
            "count": 1
        }
        await visitorsCountModel.create(data);        
    }
    let count = 0;
    let result = await visitorsCountModel.find({});
    for(let i of result){
        count += i["count"]
    }
    let response = {"visitorsCount": count};
    // console.log(response);
    res.send(response);
});

// Add each art count
app.get("/tupm/eachArtCount/:artist/:viewOrDownload", async (req, res) => {
    let artist = req.params.artist;
    let viewOrDownload = req.params.viewOrDownload;
    let exists = await eachArtCountModel.find({artist: artist});
    if(exists.length > 0){
        if(viewOrDownload == 1){
            await eachArtCountModel.updateOne({artist: artist}, {$inc: {viewCount: 1}});
            res.status(200).send("View Count Incremented!");
        } else {
            await eachArtCountModel.updateOne({artist: artist}, {$inc: {downloadCount: 1}});
            res.status(200).send("Download Count Incremented!");
        }
    } else {
        let data = {
            "artist": artist,
            "viewCount": 1,
            "downloadCount": 1
        }
        await eachArtCountModel.create(data);        
        res.status(200).send("New View and Download Count Added");
    }
})

// Add all resolutions download count
/*
    1 = Low Res
    2 = Medium Res
    3 = High Res
    4 = Ultra High Res
*/
app.get("/tupm/allResolutionDownloadCount/:resolution", async (req, res) => {
    let type = req.params.resolution;
    let exists = await allResolutionDownloadCountModel.find({type: type});
    if(exists.length > 0){
        await allResolutionDownloadCountModel.updateOne({type: type}, {$inc: {count: 1}});
        res.status(200).send("All Resolution Count Incremented!");
    } else {
        let data = {
            "type": type,
            "count": 1
        }
        await allResolutionDownloadCountModel.create(data);        
        res.status(200).send("New Resolution Count Added");
    }
})

// Connect to DB
connectToDB();



