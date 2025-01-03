const express = require('express');
const cors = require("cors");
const mongoose = require('mongoose');
const categoryRouter = require('./routes/categoryRouter');
const aiRouter = require('./routes/aiRouter');
const modelRouter = require('./routes/modelRouter');
const datasetRouter = require('./routes/datasetRouter');
const adminRouter = require('./routes/adminRouter');
const searchRouter = require('./routes/searchRouter');
const app = express();
app.use(cors());
require('dotenv').config();

app.use(express.json());
app.use((req,res,next)=>{
    console.log("HTTP method - " + req.method + " , URL - " + req.url);
    next();
});

// app.get('/home',(req,res)=>{
//     res.send("Welcome");
// })

app.use('/category',categoryRouter);
app.use('/aitools',aiRouter);
app.use('/models',modelRouter);
app.use('/datasets',datasetRouter);
app.use('/admin',adminRouter);
app.use('/search',searchRouter);

const PORT = process.env.PORT;
mongoose.connect(
  process.env.DB_CONNECTION
  
).then(()=>{
    
    console.log("MongoDB is connected");
    app.listen(PORT, () => {
        console.log("Server started on this port 5050");
    });

}).catch((error)=>{
    console.log("DB error:",error);
})
