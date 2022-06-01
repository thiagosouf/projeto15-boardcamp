import db from "../db.js";

//GAMES-GET
export async function getGames(req, res) {
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
}

//GAMES-POST
export async function postGames(req, res) {
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
};
