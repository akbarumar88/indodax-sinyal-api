import express from "express"
import dotenv from "dotenv"
import db from "./config/db2.js"

dotenv.config()

var app = express()

import cors from "cors"
import { empty } from "./helper/function.js"
const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log("Server running on port " + PORT)
})

app.get("/all", async (req, res, next) => {
  const { page = 1, perpage = 10, tglawal, tglakhir } = req.query
  let filterTgl =
    !empty(tglawal) && !empty(tglakhir)
      ? `AND tanggal BETWEEN '${tglawal} 00:00:00' AND '${tglakhir} 23:59:59'`
      : ""
  // console.log({page,perpage})
  let offset = (page - 1) * perpage
  let data = await db.query(
    `SELECT * FROM btc WHERE TRUE ${filterTgl} LIMIT ${perpage} OFFSET ${offset}`
  )
  let additional = await db.query(
    `SELECT COUNT(id) as jml FROM btc WHERE TRUE ${filterTgl}`
  )
  let dataCount = additional[0].jml
  let pageCount = Math.ceil(dataCount / perpage)
  res.json({
    data: data ?? [],
    pageCount: pageCount,
    dataCount: additional[0].jml,
  })
})
