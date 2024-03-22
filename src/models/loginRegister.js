const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const dbConfig = require('../dbConfig'); 
const router = express.Router();

async function registerUser(req, res) {
    let { emailorPhone, userName, password } = req.body;

    try {
        let pool = await sql.connect(dbConfig);
        // check if user exists
        let userExists = await pool.request()
            .input('emailorPhone', sql.NVarChar, emailorPhone)
            .query('SELECT * FROM [dbo].[users] WHERE emailorPhone = @emailorPhone;');

        if (userExists.recordset.length > 0) {
            return res.status(409).send('User already exists.');
        }

        // encrypt password
        const hashedPassword = bcrypt.hashSync(password, 10);

        // add new user
        let result = await pool.request()
            .input('emailorPhone', sql.NVarChar, emailorPhone)
            .input('userName', sql.NVarChar, userName)
            .input('password', sql.NVarChar, hashedPassword)
            .query('INSERT INTO [dbo].[users] (emailorPhone, userName, password) VALUES (@emailorPhone, @userName, @password);');

        res.status(201).send('User registered successfully.');
    } catch (err) {
        console.error('Failed to register user:', err.message);
        res.status(500).send(err.message);
    }
}


async function loginUser(req, res) {
    let { emailorPhone, password } = req.body;

    try {
        let pool = await sql.connect(dbConfig);
        let user = await pool.request()
            .input('emailorPhone', sql.NVarChar, emailorPhone)
            .query('SELECT * FROM [dbo].[users] WHERE emailorPhone = @emailorPhone;');

        if (user.recordset.length === 1) {
            // check password
            const isMatch = bcrypt.compareSync(password, user.recordset[0].password);
            if (isMatch) {
                // set token
                const token = jwt.sign({ id: user.recordset[0].id }, 'your_secret_key', { expiresIn: '7d' });
                res.json({ token });
            } else {
                res.status(401).send('Authentication failed.');
            }
        } else {
            res.status(404).send('User not found.');
        }
    } catch (err) {
        console.error('Failed to login user:', err.message);
        res.status(500).send(err.message);
    }
}


async function getUserInfo(req, res) {
    try {
        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], 'your_secret_key');
        let pool = await sql.connect(dbConfig);
        let result = await pool.request()
            .input('id', sql.Int, decoded.id)
            .query('SELECT * FROM [dbo].[users] WHERE id = @id;');
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Failed to get user info:', err.message);
        res.status(500).send(err.message);
    }
}

router.get('/userinfo', getUserInfo);


router.post('/login', loginUser);

router.post('/register', registerUser);


module.exports = router;
