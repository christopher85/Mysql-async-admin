const express = require('express')
const path = require("path");
const mysql = require("mysql");
const util = require('util');
require('dotenv').config();
const methodOverride = require('method-override')
const fileUplaod = require("express-fileupload")





const app = express()

////ejs 
app.set('view engine' , 'ejs');
app.use(fileUplaod())

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

        if(!req.files){
                return res.status(400).send('no files were uplaod');
        }
        
        const name = req.body.name
        const Ename = req.body.Ename
        const imageUplaod = req.files.image
        const image = `publics/images/${imageUplaod.name}`

       
                if(imageUplaod.mimetype === "image/jpeg" || imageUplaod.mimetype === "image/jpg" || imageUplaod.mimetype ===" image/gif" || imageUplaod.mimetype === "image/png"){
                        imageUplaod.mv(`publics/images/${imageUplaod.name}`, async function(err) {
                                if (err){
                                        return res.status(500).send(err);                                       
                                }
                                try{
                                await query("INSERT INTO cars (name, image ) VALUES (?,?);", [name, image])
                                console.log(1);
                                res.redirect("/")
                                // res.send('File uploaded!');
                                }catch(err){
                                res.send(err)
                                }
                              
                              
                              
                        });
                            

                }else {
                message = "fichier invalide"
                res.render("post", {message})
                }
                // console.log(imageUplaod);
                // await query("INSERT INTO factories (name) VALUE ('"+ name +"')")
                // await query("INSERT INTO energies (name) VALUE ('"+ Ename +"')")
               
                // res.send("ok")
                
        


})

app.delete("/categories/delete/:id", async (req, res) => {

        const id = req.params.id

        
        const factories = await query("DELETE FROM factories WHERE id = '"+ id +"';")
        const energies = await query("DELETE FROM energies WHERE id = '"+ id +"';")

        res.redirect("/")
})



app.listen(2020)
console.log('tourne sur le port 2020');