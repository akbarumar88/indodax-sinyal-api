// const mysql = require('mysql2/promise');
import mysql from "mysql2/promise"
import dotenv from "dotenv"
dotenv.config()

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_DATABASE } = process.env
async function query(sql, params) {
  const connection = await mysql.createConnection({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  })
  const [results] = await connection.execute(sql, params)
  
  connection.destroy()
  return results
}

export default {
  query,
}
