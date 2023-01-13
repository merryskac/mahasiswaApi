const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

require ('dotenv').config()

const PORT = process.env.PORT || 5000
app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
app.use(express.json())

mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true, useUnifiedTopology:true});

const mahasiswa = new mongoose.Schema({
  nim: String,
  nama: String,
  lulus: Boolean
})

mhsModel = mongoose.model('mahasiswa', mahasiswa)

const apiKey = new mongoose.Schema({
  num : Number,
  key : String
})

let apiKeyModel = mongoose.model('apiKey',apiKey)

app.get('/', (req,res)=>{
  res.sendFile(__dirname+"/interface/index.html")
  // res.json(
  //   {data:req.body}
  // )
})

app.post('/get_key',(req,res)=>{
  apiKeyModel.find({},(err,data)=>{
    if(err){
      res.json({err:err})
      return
    }
    let dataKey = {
      num:data[data.length-1].num + 1
    }
    jwt.sign(String(dataKey.num),'API_KEY',(err,token)=>{
      if(err){
        res.json({err:err})
        return
      }
       apiKeyModel.create({num:dataKey.num,key:token},(err,datas)=>{
        if(err){
          res.json({err:err})
        }
        res.json({message:"API KEY berhasil dibuat",key:datas.key})
       })
    })
    })
  })

  app.get('/input/:API_KEY',verifyUser,(req,res)=>{
    res.sendFile(__dirname+"/interface/input.html")
  })
  

function verifyUser(req,res,next){
  const bearer = req.params.API_KEY;
  jwt.verify(bearer,'API_KEY',(err,data)=>{
    if(err){
      console.log(err)
      res.json({err:err})
      return
    }
    req.body = data
    next()
  })
}

app.post('/',(req,res)=>{
  res.json(req.body)
})

app.post('/inputData',(req,res)=>{
  mhsModel.create({nim: req.body.nim,
  nama: req.body.nama,
  lulus: req.body.lulus},(err,data)=>{
    if(err){
      console.log(res.json({err:err}))
      return
    }
    res.json({ket: "berhasil diinput",data:{
  nim: data.nim,
  nama:data.nama,
  lulus:data.lulus}})
  })
})

app.get('/mahasiswa',(req,res)=>{
  if(req.query.lulus){
    mhsModel.find({lulus:req.query.lulus},(err,data)=>{
      if(err){
        res.json({err:err})
        return
      }
      let datas = []
      let no=0
      data.forEach(value=>{
        datas.push({
          no:++no,
          nim:value.nim,
          nama:value.nama,
          lulus:value.lulus
        })
      })
      res.json({total:data.length,Mahasiswa:datas})
      return
    })
  }
  else{
  mhsModel.find({},(err,data)=>{
    if(err){
      res.json({err:err})
      return
    }
    let no = 0
    let datas = []
    data.forEach(value=>{
      datas.push(
        {no:++no,
        nim:value.nim,
        nama:value.nama,
        lulus:value.lulus}
      )
    })
    res.json({total: data.length,mahasiswa: datas})
  })}
})

app.get('/mahasiswa/:nim',(req,res)=>{
  mhsModel.findOne({nim: req.params.nim.toUpperCase()},(err,data)=>{
    if(err){
    res.json({err:err})
    return
  }
  res.json(
    {nim:data.nim,
    nama:data.nama,
    lulus:data.lulus})
})

app.get('/mahasiswa',(req,res)=>{
  mhsModel.findOne({lulus:req.query.lulus},(err,data)=>{
    if(err){
      res.json({err:err})
      return
    }
    console.log(req.query)
  })
})
})

app.listen(5000,()=>{
  console.log(`server running at port ${PORT}`)
})