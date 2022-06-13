import express from "express"
import dotenv from "dotenv"
import db from "./config/db2.js"

dotenv.config()

var app = express()

import cors from "cors"
import { empty } from "./helper/function.js"
import moment from "moment"
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
    jenis,
    level,
  } = req.query
  // console.log(req.query)
  let filterTgl =
    !empty(tglawal) && !empty(tglakhir)
      ? `AND tanggal BETWEEN '${tglawal} 00:00:00' AND '${tglakhir} 23:59:59'`
      : ""

  // console.log(typeof hargaUSDTDari, typeof hargaUSDTSampai)
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

  let filterJenis = !empty(jenis) ? `AND jenis = '${jenis}'` : ""

  let filterLevel = !empty(level) ? `AND level = '${level}'` : ""
  // console.log({page,perpage})
  let offset = (page - 1) * perpage
  try {
    let query = `SELECT * FROM btc WHERE TRUE ${filterTgl} ${filterHargaUSDT} ${filterHargaIDR} ${filterVolUSDT} ${filterVolIDR} ${filterLastBuy} ${filterLastSell} ${filterJenis} ${filterLevel} LIMIT ${perpage} OFFSET ${offset}`
    // console.log(query)
    let data = await db.query(query)

    let queryCount = `SELECT COUNT(id) as jml FROM btc WHERE TRUE ${filterTgl} ${filterHargaUSDT} ${filterHargaIDR} ${filterVolUSDT} ${filterVolIDR} ${filterLastBuy} ${filterLastSell}  ${filterJenis} ${filterLevel}`
    let additional = await db.query(queryCount)
    let dataCount = additional[0].jml
    let pageCount = Math.ceil(dataCount / perpage)
    res.json({
      pageCount: pageCount,
      dataCount: additional[0].jml,
      data: data ?? [],
    })
  } catch (e) {
    res.status(500)
    res.json({
      data: [],
      pageCount: 0,
      dataCount: 0,
      // errorMessage: e.message,
      error: e,
    })
  }
})

app.get("/levelchart", async (req, res, next) => {
  const { level = [], jenis = "" } = req.query
  // console.log(level)
  let filterJenis = !empty(jenis) ? ` AND jenis = '${jenis}'` : ""
  let today = moment().format("YYYY-MM-DD")
  let periode = 6
  let data = []

  try {
    for (let i = 0; i < periode; i++) {
      let periodeNow = moment().subtract(i, "M")
      let tglawal = periodeNow.startOf("M").format("YYYY-MM-DD")
      let tglakhir = periodeNow.endOf("M").format("YYYY-MM-DD")
      let qAwal = `SELECT count(id) as jml FROM btc WHERE tanggal BETWEEN '${tglawal} 00:00:00' AND '${tglakhir} 23:59:59' ${filterJenis}`
      let obj = {
        periode: periodeNow.format("YYYY MMM"),
        periodeTgl: periodeNow.format("YYYY-MM-DD"),
      }

      for (let curlevel of level) {
        let qConcat = `${qAwal} AND level = '${curlevel}'`
        let res = await db.query(qConcat)
        obj[curlevel] = res[0].jml
        console.log(qConcat)
      }
      data = [...data, obj]
    }
    res.json({ data })
  } catch (e) {
    res.status(500)
    res.json({
      data: [],
      errorMessage: e.message,
      error: e,
    })
  }
})

app.get("/levelchartdate", async (req, res, next) => {
  let defTglAwal = moment().subtract(6, "M").format("YYYY-MM-DD")
  let defTglAkhir = moment().format("YYYY-MM-DD")
  const {
    level = [],
    jenis = "",
    tglawal = defTglAwal,
    tglakhir = defTglAkhir,
  } = req.query
  console.log({ level, tglawal, tglakhir })
  let filterJenis = !empty(jenis) ? ` AND jenis = '${jenis}'` : ""
  let from = moment(tglawal)
  let to = moment(tglakhir)
  let diff = to.diff(from, "M")
  let periode = diff + 1
  // console.log({ diff })
  let data = []

  try {
    for (let i = 0; i < periode; i++) {
      let periodeNow = moment().subtract(i, "M")
      let tglawal = periodeNow.startOf("M").format("YYYY-MM-DD")
      let tglakhir = periodeNow.endOf("M").format("YYYY-MM-DD")
      let qAwal = `SELECT count(id) as jml FROM btc WHERE tanggal BETWEEN '${tglawal} 00:00:00' AND '${tglakhir} 23:59:59' ${filterJenis}`
      let obj = {
        periode: periodeNow.format("YYYY MMM"),
        periodeTgl: periodeNow.format("YYYY-MM-DD"),
      }

      for (let curlevel of level) {
        let qConcat = `${qAwal} AND level = '${curlevel}'`
        let res = await db.query(qConcat)
        obj[curlevel] = res[0].jml
        console.log(qConcat)
      }
      data = [...data, obj]
    }
    res.json({ data })
  } catch (e) {
    res.status(500)
    res.json({
      data: [],
      errorMessage: e.message,
      error: e,
    })
  }
})

app.get("/volumechartdate", async (req, res, next) => {
  let defTglAwal = moment().subtract(6, "M").format("YYYY-MM-DD")
  let defTglAkhir = moment().format("YYYY-MM-DD")
  const {
    level = [],
    jenis = "",
    tglawal = defTglAwal,
    tglakhir = defTglAkhir,
    volume = "idr",
  } = req.query
  console.log({ level, tglawal, tglakhir })
  let filterJenis = !empty(jenis) ? ` AND jenis = '${jenis}'` : ""
  let from = moment(tglawal)
  let to = moment(tglakhir)
  let diff = to.diff(from, "M")
  let periode = diff + 1
  // console.log({ diff })
  let data = []

  let col = volume == "idr" ? "volidr" : "volusdt"
  try {
    for (let i = 0; i < periode; i++) {
      let periodeNow = moment().subtract(i, "M")
      let tglawal = periodeNow.startOf("M").format("YYYY-MM-DD")
      let tglakhir = periodeNow.endOf("M").format("YYYY-MM-DD")
      let qAwal = `SELECT sum(${col}) as jml FROM btc WHERE tanggal BETWEEN '${tglawal} 00:00:00' AND '${tglakhir} 23:59:59' ${filterJenis}`
      let obj = {
        periode: periodeNow.format("YYYY MMM"),
        periodeTgl: periodeNow.format("YYYY-MM-DD"),
      }

      for (let curlevel of level) {
        let qConcat = `${qAwal} AND level = '${curlevel}'`
        let res = await db.query(qConcat)
        obj[curlevel] = parseFloat(res[0].jml)
        console.log(qConcat)
      }
      data = [...data, obj]
    }
    res.json({ data })
  } catch (e) {
    res.status(500)
    res.json({
      data: [],
      errorMessage: e.message,
      error: e,
    })
  }
})
