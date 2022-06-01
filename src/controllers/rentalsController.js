import db from "../db.js";

import dayjs from 'dayjs';

//RENTALS-GET
export async function getRentals(req, res) {
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
}

//RENTALS-POST
export async function postRentals(req, res) {
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
}

//RENTALS-POST (RETORNO)
export async function postIdRentals(req, res) {
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
}

//RENTALS-DELETE
export async function deleteRentals(req, res) {
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
    
}