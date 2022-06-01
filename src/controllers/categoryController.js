import db from "../db.js";

//CATEGORIES-GET
export async function getCategory(req, res) {
    try {
        const categorias = await db.query('SELECT * FROM categories');
        res.status(200).send(categorias.rows);
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Erro ao buscar categorias");
    }
}
//CATEGORIES-POST
export async function postCategory(req, res) {
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
}