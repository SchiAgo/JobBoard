const User = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUND = 12;

const registerUser = async (userData) => {
    // da userData prendo la mail
    const { email, password } = userData;

    // Controllo se l'utente esiste già
    const esiste = await User.findByEmail(email);

    if (esiste.rows && esiste.rows.length > 0) {
        const err = new Error('Email già presente');
        err.statusCode = 409;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

    // Creiamo l'utente passandogli l'hash corretto
    return await User.create({
        ...userData,
        password: hashedPassword
    });
};

const loginUser = async (email, password) => {
    //prendo l'utente da User con la mail
    const user = await User.findByEmail(email);

    // test
    console.log("Risultato DB:", user.rows[0]);

    // DEBUG: Vediamo cosa arriva esattamente dal DB
    //console.log("DEBUG USERDATA:", userResult);

    if (!user || user.rows.length === 0) {
        const err = new Error("Credenziali non valide");
        err.statusCode = 401;
        throw err;
    }

    const userData = user.rows[0];

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
        const err = new Error("Credenziali non valide");
        err.statusCode = 401;
        throw err;
    }


    const token = jwt.sign(
        {
            id: userData.id,
            role: userData.role,
            token_version: userData.token_version
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );


    return { user: userData, token };
};

module.exports = {
    registerUser,
    loginUser
};
