import knex from 'knex'
import 'dotenv/config'

const db = knex({
    client: "pg",
    connection: process.env.DB_URL
})

export default db
