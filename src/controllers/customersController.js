import db from "../db.js";

//CUSTOMERS-GET
export const getCustomers = async (req, res) => {
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
}

//CUSTOMERS-GET /:ID
export const getIdCustomers = async (req, res) => {
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
}

//CUSTOMERS-POST
export const postCustomers = async (req, res) => {
    const { name, phone, cpf, birthday } = req.body;
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
}

//CUSTOMERS-PUT
export const putCustomers = async (req, res) => {
    const { id } = req.params;
    const { name, phone, cpf, birthday } = req.body;
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
}