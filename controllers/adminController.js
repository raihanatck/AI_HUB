const express = require('express');
const jwt = require('jsonwebtoken')
const SECRET_KEY = "GEttingdata!@#";
const mongoose = require('mongoose');
const admin = require('../models/admin');

const signup = async (req, res) => {

    const { email, password } = req.body;
    
    try {

        emailpattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email.match(emailpattern)) {
            return res.status(404).json({ Message: "Please enter valid email" });
        }
        const trimmedpassword = password.trim();
        if (!password || trimmedpassword == '') {
            return res.status(404).json({ Message: "Password is required" });
        }
        if (trimmedpassword.length < 8 || trimmedpassword.length > 17) {
            return res.status(404).json({ Message: "Password must be 8 to 16 characters" })
        }

        // Existing user check
        const existingUser = await admin.findOne({ email: email })
        if (existingUser) {
            return res.status(404).json({ Message: "User already exist" });
        }

        const result = await admin.create({
            email: email,
            password: password
            
        });

        // Token generate
        const token = jwt.sign({ email: result.email, id: result.id }, SECRET_KEY);

        // Send response
        return res.status(200).json({ user: result, token: token });

    } catch (error) {
        console.log("Admin signup error: ",error);
        return res.status(500).json({ Message: "Something went wrong" });

    }
};

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);  // This checks the expiration date as well
        return decoded;
    } catch (err) {
        return null;  // Token is invalid or expired
    }
};

const signin = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Check user is existing 
        const existingUser = await admin.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ Message: "User not found" });
        }

        emailpattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email.match(emailpattern)) {
            return res.status(404).json({ Message: "Please enter valid email" });
        }
        // Compare password with DB
        if (existingUser.password !== password) {
            return res.status(404).json({ Message: "You have entered invalid password" })
        }

        // Geneerate token
        const token = jwt.sign({ email: existingUser.email, id: existingUser.id }, SECRET_KEY, { expiresIn: '1d' });
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(404).json({ Message: "Session expired or invalid token. Please login again." });
        }
        // Send response
        return res.status(200).json({ user: existingUser, token: token });


    } catch (error) {
        console.log("Admin signin error: ",error);
        return res.status(500).json({ Message: "Something went wrong" });
    }
};

module.exports = { signup, signin };