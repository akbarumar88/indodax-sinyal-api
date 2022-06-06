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
  const {
    page = 1,
    perpage = 10,
    tglawal,
    tglakhir,
    hargaUSDTDari,
    hargaUSDTSampai,
    hargaIDRDari,
    hargaIDRSampai,
    volUSDTDari,
    volUSDTSampai,
    volIDRDari,
    volIDRSampai,
    lastBuyDari,
    lastBuySampai,
    lastSellDari,
    lastSellSampai,
  } = req.query
  let filterTgl =
    !empty(tglawal) && !empty(tglakhir)
      ? `AND tanggal BETWEEN '${tglawal} 00:00:00' AND '${tglakhir} 23:59:59'`
      : ""

  let filterHargaUSDT =
    !empty(hargaUSDTDari) && !empty(hargaUSDTSampai)
      ? `AND hargausdt BETWEEN ${hargaUSDTDari} AND ${hargaUSDTSampai}`
      : ""

  let filterHargaIDR =
    !empty(hargaIDRDari) && !empty(hargaIDRSampai)
      ? `AND hargaidr BETWEEN ${hargaIDRDari} AND ${hargaIDRSampai}`
      : ""

  let filterVolUSDT =
    !empty(volUSDTDari) && !empty(volUSDTSampai)
      ? `AND volusdt BETWEEN ${volUSDTDari} AND ${volUSDTSampai}`
      : ""

  let filterVolIDR =
    !empty(volIDRDari) && !empty(volIDRSampai)
      ? `AND volidr BETWEEN ${volIDRDari} AND ${volIDRSampai}`
      : ""

  let filterLastBuy =
    !empty(lastBuyDari) && !empty(lastBuySampai)
      ? `AND lastbuy BETWEEN ${lastBuyDari} AND ${lastBuySampai}`
      : ""
  let filterLastSell =
    !empty(lastSellDari) && !empty(lastSellSampai)
      ? `AND lastsell BETWEEN ${lastSellDari} AND ${lastSellSampai}`
      : ""
  // console.log({page,perpage})
  let offset = (page - 1) * perpage
  let query = `SELECT * FROM btc WHERE TRUE ${filterTgl} ${filterHargaUSDT} ${filterHargaIDR} ${filterVolUSDT} ${filterVolIDR} ${filterLastBuy} ${filterLastSell} LIMIT ${perpage} OFFSET ${offset}`
  console.log(query)
  let data = await db.query(query)

  let queryCount = `SELECT COUNT(id) as jml FROM btc WHERE TRUE ${filterTgl} ${filterHargaUSDT} ${filterHargaIDR} ${filterVolUSDT} ${filterVolIDR} ${filterLastBuy} ${filterLastSell}`
  let additional = await db.query(queryCount)
  let dataCount = additional[0].jml
  let pageCount = Math.ceil(dataCount / perpage)
  res.json({
    data: data ?? [],
    pageCount: pageCount,
    dataCount: additional[0].jml,
  })
})
