const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotEnv= require('dotenv').config()
const path = require('path')


const saucesRoutes= require('./routes/sauces')

const userRoutes = require('./routes/user');


mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.URL_CLUSTER}/${process.env.DB}?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app =express();
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

   
app.use('/images', express.static(path.join(__dirname,'images')))

 app.use('/api/auth', userRoutes)
 app.use('/api/sauces', saucesRoutes)

module.exports= app;