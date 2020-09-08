const express = require('express')
const path = require("path");
const mysql = require("mysql");
const util = require('util');
require('dotenv').config();
const methodOverride = require('method-override')





const app = express()

////ejs 
app.set('view engine' , 'ejs');


// Middleware
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//override
////////////
app.use(methodOverride("_method"));


// Static
app.use(express.static(path.join(__dirname, 'public')));

// Mysql
const db = mysql.createConnection ({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DATABASE,
    // multipleStatements: true
});

db.connect((err) => {
    if (err) { throw err;}
    console.log('Connecté à la base MySQL');
});

const query = util.promisify(db.query).bind(db)

global.db = db;
global.query = query;







app.get("/", async (req, res) => {

    // const query =  ["SELECT* FROM factories", "SELECT * FROM energies"]

    // db.query(query, (err, result) => {
        //     console.log(result);
        //     res.render("index", {factories: result[0], energies: result[1]})
        // })


        const factories = await query('SELECT * FROM factories')
        const energies = await query('SELECT * FROM energies')

        // console.log(energies);

        res.render('index', {factories, energies})

        
})

app.get("/categories/post", (req, res) => {

       


        res.render('post')
})
app.post("/categories/post", async (req, res) => {

        const name = req.body.name
        const Ename = req.body.Ename

        await query("INSERT INTO factories (name) VALUE ('"+ name +"')")
        await query("INSERT INTO energies (name) VALUE ('"+ Ename +"')")

        res.redirect("/")
})
app.delete("/categories/delete/:id", async (req, res) => {

        const id = req.params.id

        
        const factories = await query("DELETE FROM factories WHERE id = '"+ id +"';")
        const energies = await query("DELETE FROM energies WHERE id = '"+ id +"';")

        res.redirect("/")
})



app.listen(2020)
console.log('tourne sur le port 2020');