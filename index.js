import express, { json } from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import dayjs from 'dayjs';

import db from "./db.js";

const app = express();
app.use(cors());
app.use(json());
dotenv.config();

//CATEGORIES-GET
app.get('/categories', async (req, res) => {
    try {
        const categorias = await db.query('SELECT * FROM categories');
        res.status(200).send(categorias.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Erro ao buscar categorias");
    }
})
//CATEGORIES-POST
app.post('/categories', async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400).send("Nome da categoria não pode ser vazio");
    }
    else {
        const validation = await db.query('SELECT * FROM categories WHERE name = $1', [name]);
        if (validation.rows.length > 0) {
            res.status(409).send("Categoria já existe");
        }
        else {
            try {
                const categorias = await db.query('INSERT INTO categories (name) VALUES ($1)', [name]);
                res.status(201).send("Categoria cadastrada");
            }
            catch (err) {
                console.log(err);
                res.status(500).send("Erro ao cadastrar categoria");
            }
        }
    }
})

//GAMES-GET
app.get('/games/', async (req, res) => {
    const { name } = req.query;
    try {
        if (name) {
            const games = await db.query('SELECT games.*, categories.name as "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id WHERE games.name ILIKE $1', [`${name}%`]);
            if (games.rows.length === 0) {
                res.status(404).send("Jogo não existe");
            }
            else {
                res.status(200).send(games.rows);
            }
        }
        else {
            const games = await db.query('SELECT games.*, categories.name as "categoryName" FROM games JOIN categories ON games."categoryId" = categories.id');
            res.status(200).send(games.rows);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Erro ao buscar jogo");
    }
})

//GAMES-POST
app.post('/games', async (req, res) => {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;
    if (!name || !stockTotal || !categoryId || !pricePerDay) {
        res.status(400).send("Valores devem ser preenchidos");
    }
    else {
        const validationId = await db.query('SELECT * FROM categories WHERE id = $1', [categoryId]);
        const validationName = await db.query('SELECT * FROM games WHERE name = $1', [name]);
        console.log(validationId.rows);
        if (validationId.rows.length === 0) {
            res.status(400).send("Categoria não existe");
        }
        else {
            if (validationName.rows.length > 0) {
                res.status(409).send("Jogo já existe");
            }
            else {
                try {
                    const games = await db.query('INSERT INTO games (name,image,"stockTotal","categoryId","pricePerDay") VALUES ($1, $2, $3, $4, $5)', [name, image, stockTotal, categoryId, pricePerDay]);
                    res.status(201).send("Jogo cadastrado");
                }
                catch (err) {
                    console.log(err);
                    res.status(500).send("Erro ao cadastrar jogo");
                }
            }
        }
    }
});

//CUSTOMERS-GET
app.get('/customers/', async (req, res) => {
    const { cpf } = req.query;
    console.log(cpf)
    try{
        if (cpf){
            const validation = await db.query('SELECT * FROM customers WHERE cpf ILIKE $1', [`${cpf}%`]);
            if(validation.rows.length === 0){
                res.status(404).send("Cliente não existe");
            }
            else{
                res.status(200).send(validation.rows);
            }}
        else{
            const customers = await db.query('SELECT * FROM customers');
            res.status(200).send(customers.rows);
        }
        }
    catch(err){
        console.log(err);
        res.status(500).send("Erro ao buscar cliente");
    }       
})

//CUSTOMERS-GET /:ID
app.get('/customers/:id', async (req, res) => {
    const { id } = req.params;
    try{
        const validation = await db.query('SELECT * FROM customers WHERE id = $1', [id]);
        console.log(validation.rows);
        if(validation.rows.length === 0){
            res.status(404).send("Cliente não existe");
        }
        else{
            res.status(200).send(validation.rows);
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send("Erro ao buscar cliente");
    }
})

//CUSTOMERS-POST
app.post('/customers', async (req, res) => {
    const { name, phone, cpf, birthday } = req.body;
    // const birthdayDate = dayjs(birthday).format('DD-MM-YYYY');
    if (!name || !phone || !cpf || !birthday) {
        res.status(400).send("Valores devem ser preenchidos");
    }
    else{
        const validation = await db.query('SELECT * FROM customers WHERE cpf = $1', [cpf])
        if(validation.rows.length > 0){
            res.status(409).send("Cliente já existe");
        }
        else{
            try{
                const customers = await db.query('INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4)', [name, phone, cpf, birthday])
                res.status(201).send("Cliente cadastrado");
            }
            catch(err){
                console.log(err);
                res.status(500).send("Erro ao cadastrar cliente");
            }
        }
}
});

//CUSTOMERS-PUT
app.put('/customers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;
    // const birthdayDate = dayjs(birthday).format('DD-MM-YYYY');
    if (!name || !phone || !cpf || !birthday) {
        res.status(400).send("Valores devem ser preenchidos");
    }
    else {
        try {
            const customers = await db.query('UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5', [name, phone, cpf, birthday, id]);
            res.status(200).send("Cliente atualizado");
        }
        catch (err) {
            console.log(err);
            res.status(500).send("Erro ao atualizar cliente");
        }
    }
})

//RENTALS-GET
app.get('/rentals/', async (req, res) => {
    const { customerId, gameId } = req.query;
    try {
        if (customerId) {
            const rentals = await db.query('SELECT rentals.*, customers.name AS "customerName", games.name AS "gameName", categories.id AS "categoryId", categories.name AS "categoryName" FROM rentals JOIN customers ON customers.id = rentals."customerId" JOIN games ON games.id = rentals."gameId" JOIN categories ON games."categoryId" = categories.id WHERE "customerId" = $1', [customerId]);
            if (rentals.rows.length === 0) {
                res.status(404).send("Locacao não existe");
            }
            else {
                res.status(200).send(rentals.rows);
            }
        }
        else if (gameId) {
            const rentals = await db.query('SELECT rentals.*, customers.name AS "customerName", games.name AS "gameName", categories.id AS "categoryId", categories.name AS "categoryName" FROM rentals JOIN customers ON customers.id = rentals."customerId" JOIN games ON games.id = rentals."gameId" JOIN categories ON games."categoryId" = categories.id WHERE "gameId" = $1', [gameId]);       
            if (rentals.rows.length === 0) {
                res.status(404).send("Locacao não existe");
            }
            else {
                res.status(200).send(rentals.rows);
            }
        }
        else {
            const rentalsList = await db.query('SELECT rentals.*, customers.name AS "customerName", games.name AS "gameName", categories.id AS "categoryId", categories.name AS "categoryName" FROM rentals JOIN customers ON customers.id = rentals."customerId" JOIN games ON games.id = rentals."gameId" JOIN categories ON games."categoryId" = categories.id;');
         
             let rentals = rentalsList.rows; 
             
             const sendRentals = []; 
             for (let rental of rentals) { 
             rental = { 
             ...rental, 
             customer: { 
             id: rental.customerId, 
             name: rental.customerName 
             }, 
             game: { 
             id: rental.gameId, 
             name: rental.gameName, 
             categoryId: rental.categoryId, 
             categoryName: rental.categoryName 
             } 
             } 
             delete rental.customerName; 
             delete rental.gameName; 
             delete rental.categoryId; 
             delete rental.categoryName; 
             sendRentals.push(rental); 
             } 
             
             res.status(200).send(sendRentals);
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Erro ao buscar locacao");
    }
})

//RENTALS-POST
app.post('/rentals', async (req, res) => {
    const { customerId, gameId, daysRented} = req.body;
    if (!customerId || !gameId || !daysRented) {
        res.status(400).send("Valores devem ser preenchidos");
    }
    else {
        const validationCustomer = await db.query('SELECT * FROM customers WHERE id = $1', [customerId]);
        const validationGame = await db.query('SELECT * FROM games WHERE id = $1', [gameId]);
        if (validationCustomer.rows.length === 0 || validationGame.rows.length === 0) {
            res.status(404).send("Cliente ou jogo não existe");
        }
        else {
            try {
                const rentals = await db.query('INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7)', [customerId, gameId, dayjs(), daysRented, null, validationGame.rows[0].pricePerDay*daysRented
                , 0]);
                res.status(201).send("Locacao cadastrada");
            }
            catch (err) {
                console.log(err);
                res.status(500).send("Erro ao cadastrar locacao");
            }
        }
    }
})

//RENTALS-POST (RETORNO)
app.post('/rentals/:id/return', async (req, res) => {
    const { id } = req.params;
    const returnDate = dayjs();
    
    const rentals = await db.query('SELECT * FROM rentals WHERE id = $1', [id]);
    const game = await db.query('SELECT * FROM games WHERE id = $1', [rentals.rows[0].gameId]);

    function calculateDelayFee(rentDate, returnDate) {
        const delayFee = dayjs(returnDate).diff(dayjs(rentDate), 'days')
        if (delayFee > 0) {
            return delayFee * game.rows[0].pricePerDay;
        }
        else {
            return 0;
    }}

    try{
        const rental = await db.query('UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3', [returnDate, calculateDelayFee(rentals.rows[0].rentDate, returnDate), id]);
        res.status(201).send("Locacao atualizada");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Erro ao atualizar locacao");
    }
})

//RENTALS-DELETE
app.delete('/rentals/:id', async (req, res) => {
    const { id } = req.params;
    const rentals = await db.query('SELECT * FROM rentals WHERE id = $1', [id]);
    if (rentals.rows.length === 0) {
        res.status(404).send("Locacao não existe");
    }
    else if
        (rentals.rows[0].returnDate === null) {
            res.status(400).send("Locacao não pode ser deletada");
        }
        else {
            try {
                const rentals = await db.query('DELETE FROM rentals WHERE id = $1', [id]);
                res.status(200).send("Locacao deletada");
            }
            catch (err) {
                console.log(err);
                res.status(500).send("Erro ao deletar locacao");
            }

    }
    
})

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));