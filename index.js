const express = require('express');
const app = express();
const path = require('path'); 
const cookieParser = require('cookie-parser');
const http = require('http');
const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);

const mongoose = require("mongoose");
const {MONGO_DB_CONFIG} = require("./config/app.config");
const {initMeetingServer} = require("./meeting-server");
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}
app.use(cors(corsOptions)) // Use this after the variable declaration


initMeetingServer(server)

mongoose.Promise = global.Promise;
mongoose.connect(MONGO_DB_CONFIG.DB, {
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  family: 4
})
.then(() => {
  console.log("Database connected");
}, (error) => {
  console.log("Database can't be connected: " + error);
})

var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.json());
app.use("/api", require("./routes/app.routes"));
app.post('/', (req, res) => {
  let data = req.body;
  res.send('Data Received: ' + JSON.stringify(data));
})
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, './public-flutter')));
// app.get('*', (_, res) => {
//   res.sendFile(path.resolve(__dirname, './public-flutter/index.html'));
// });

server.listen(process.env.port || 3002, () => {
  console.log('Ready to Go!');
});
