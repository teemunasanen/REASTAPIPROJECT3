// Moduulit käyttöön
const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors")


//Portti
let PORT = process.env.PORT || 8080;

app.use(cors());
//asetetaan ejs templatet 
app.set("view engine", "ejs");
//staattinen sisältö public kansiosta
var dir = path.join(__dirname, 'public');
app.use(express.static(dir));
//express bodyparsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//database osoite + passu
let uri = 
  process.env.DB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//mongoose yhteys
const db = mongoose.connection;
db.on("error", function () {
  console.log("connection error");
});
db.once("open", function () {
  console.log("we're connected!");
});
//mongoose db model
const Customer = mongoose.model(
  "Customer",
  {
    username: String,
    name: String,
    email: String,
  },
  "customers"
);
//reitti etusivulle
app.get("/", function (req, res) {
  res.render("pages/index");
});
//reitti joka palauttaa kaiken
app.get("/getall", function (req, res) {
  Customer.find({}, function (err, results) {
    if (err) {
      res.status(500).json("Järjestelmässä tapahtui virhe");
    } else {
      console.log("Kaikki tiedot haettu");
      res.status(200).json(results);
    }
  });
});
//reitti jolla haetaan id:n perusteella
app.get("/:id", function (req, res) {
  let id = req.params.id;
  Customer.find({ _id: id }, function (err, results) {
    if (err) {
      res.status(500).json("Järjestelmässä tapahtui virhe");
    } else {
      console.log("Käyttäjän tiedot haettu");
      res.status(200).json(results);
    }
  });
});
//reitti lisäämiselle
app.post("/add", function (req, res) {
  const newCustomer = new Customer({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  });
  newCustomer.save(function (err, customer) {
    if (err) console.log(err);
    console.log("Tallennettu: " + customer);
  });
});
//mongoose update vaati 'useFindAndModify'->false
mongoose.set("useFindAndModify", false);
//reitti päivittämiselle: muokkaa nimeä
app.put("/update/:id", function (req, res) {
 let id = req.params.id;

  Customer.findByIdAndUpdate({_id:id}, {name: req.body.name}, { new: true }, function (err, results) {
    if (err) {
      res.status(500).json("Järjestelmässä tapahtui virhe");
    } else {
      res.status(200).json("Updated " + id);
    }
  });
});
//reitti poistamiselle id:n perusteella
app.delete("/delete/:id", function (req, res) {
  let id = req.params.id;

  Customer.findByIdAndDelete(id, function (err, results) {
    if (err) {
      res.status(500).json("Järjestelmässä tapahtui virhe");
    } else if (results == null) {
      res.status(200).json("Poistetavaa ei löytynyt.");
    } else {
      res.status(200).json("Deleted " + id);
    }
  });
});

app.listen(PORT, function () {
  console.log("The action starts behind door number: " + PORT);
});
