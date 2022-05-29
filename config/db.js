import mysql from "mysql"
import dotenv from "dotenv"
dotenv.config()

const { DB_HOST, DB_USERNAME, DB_PASSWORD, DB_PORT, DB_DATABASE } = process.env
var connection

function handleDisconnect() {
  connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
  }) // Recreate the connection, since
  // the old one cannot be reused.

  connection.connect(function (err) {
    // The server is either down
    if (err) {
      // or restarting (takes a while sometimes).
      console.log("error when connecting to db:", err)
      setTimeout(handleDisconnect, 2000) // We introduce a delay before attempting to reconnect,
    } // to avoid a hot loop, and to allow our node script to
  }) // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  connection.on("error", function (err) {
    console.log("db error", err)
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      /**
       * Connection to the MySQL server is usually
       * lost due to either server restart, or a
       * connnection idle timeout (the wait_timeout
       * server variable configures this)
       */
      handleDisconnect()
    } else {
      throw err
    }
  })
}
handleDisconnect()
// connection.query("SELECT 1 + 1 AS solution", function (error, results, fields) {
//   if (error) throw error
//   console.log("The solution is: ", results[0].solution)
// })

// connection.end()

export default connection