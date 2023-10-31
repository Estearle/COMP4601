const express = require('express');
const app = express();
const Page = require("./Page.js");
const Game = require("./Game.js");
const elasticlunr = require("elasticlunr");
const mongoose = require('mongoose');
const { connect, Types } = mongoose;
//process.env.PORT will see if there is a specific port set in the environment
const PORT = process.env.PORT || 3000
const ROOT_DIR_JS = '/public/js'; //root directory for javascript files
const ROOT_DIR_CSS = '/public/css'; //root directory for css files

const path = require('path');
const url = require('url');

app.use(express.static(__dirname + ROOT_DIR_JS)) //provide static server
app.use(express.static(__dirname + ROOT_DIR_CSS)) //provide static server

//convert JSON stringified strings in a POST request to JSON
app.use(express.json());
app.set('views', './views')
app.set('view engine', 'pug')

//Create your index
//Specify fields you want to include in search
//Specify reference you want back (i.e., page ID)
const index = elasticlunr(function () {
    this.addField('title');
    this.addField('content');
    this.setRef('title');
});

app.get("/fruits",(req,res)=>{
    let q = req.params.q;
    let boost = req.params.boost;
    let limit = req.params.limit;
})

app.get("/personal",(req,res)=>{

})