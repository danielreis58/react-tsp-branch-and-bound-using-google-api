const express = require('express');
var bodyParser = require("body-parser");
const cors = require('cors');
const app = express();

let googleRouter = require('./app/routers/googleRouter');


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use((req, res, next) => {
    console.log(req.originalUrl);
    next();
})

app.use('/google', googleRouter);

app.get('/', (req, res) => res.send("Proxy Google!!!"));

const server = app.listen(4000, function () {
    console.log("App listening at http://%s:%s", server.address().address.toString(), server.address().port);
})