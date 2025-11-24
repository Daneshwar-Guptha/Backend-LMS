const express = require('express')
const mongoose = require('mongoose');
require('dotenv').config({ quiet: true });
const uri = process.env.MONGO_URI;

const DBConnection = async() => {
    await mongoose.connect(uri)
        .then(() => {
            console.log("DBConnection was successful")
        })
        .catch(error => {
            console.log("DB was not connected");
        })

}
module.exports = DBConnection;