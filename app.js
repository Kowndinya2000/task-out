const express = require('express')
const session = require('express-session')
const passport = require('passport')
const WebAppStrategy = require('ibmcloud-appid').WebAppStrategy
var path = require('path')
var PORT = process.env.PORT || 3000
var bodyParser = require("body-parser")
var cors = require('cors')
var crypto = require('crypto')
var multer = require('multer')
var GridFsStorage = require('multer-gridfs-storage')
var GridFsStream = require('gridfs-stream')
var methodOverride = require('method-override')
var mongoose = require('mongoose')
const app = express()
app.use(express.static('./public'))
app.set('views',path.join(__dirname,'public'))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(methodOverride('_method'))
app.use(cors({
    credentials: true,
}))



var url = "mongodb+srv://kowndi:kowndi@6772@cluster0-wm2aj.mongodb.net/iitt_task?retryWrites=true&w=majority";
const connection = mongoose.createConnection(url,{useNewUrlParser:true,useUnifiedTopology:true})
  let gfs;
  connection.once('open',()=>{
    gfs = GridFsStream(connection.db,mongoose.mongo)
    //gfs.collection('uploads')
  })
// Starting GridFS Engine
const storage = new GridFsStorage({
url:url,
file: (req,file)=>{
  return new Promise((resolve,reject)=>{
    crypto.randomBytes(16,(err,buf)=>{
      if(err)
      { 
        return reject(err)
      }
      gfs.collection(req.body.email2)
      const filename = buf.toString('hex') + path.extname(file.originalname)
      req.body.filei = filename
      const fileInfo = {
          filename: filename,
          metadata: { 
            date: req.body.date, 
            time: req.body.time,
            endTime: req.body.endTime,
            title: req.body.title,
            notify_before: req.body.notify_before,
            link: req.body.link,
            note: req.body.note},
        bucketName: req.body.email2
      }
      console.log(fileInfo)
      resolve(fileInfo)
    }) 
  })
}
})
const schedule = multer({storage})
app.use(session({
    secret: '123456',
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user,cb)=>cb(null,user))
passport.deserializeUser((user,cb)=>cb(null,user))
passport.use(new WebAppStrategy({
    tenantId: "c67db998-e74a-4e95-ab05-7325ca80414e",
    clientId: "fb378d92-0180-4b2d-88ca-b0376fd32251",
    secret: "NjE1ZTU0YzctOTRjZC00ZWE1LWE4OGEtMjZlYjRkZWVlYWY2",
    oauthServerUrl:"https://eu-gb.appid.cloud.ibm.com/oauth/v4/c67db998-e74a-4e95-ab05-7325ca80414e",
    redirectUri: "https://task-out.herokuapp.com/appid/callback"
}))

app.get('/',(req,res)=>{
res.header('Acess-Control-Allow-Credentials','true')
res.header('Access-Control-Allow-Origin', '*');
  res.render('index',{
    return_message:req.query.rm,
    noti_msg:req.query.noti_list,
    notify: req.query.notify_now})
}
)
app.get('/appid/login',passport.authenticate(WebAppStrategy.STRATEGY_NAME,{
    successRedirect: '/',
    forceLogin: true
}))


//Handle callback
app.get('/appid/callback',passport.authenticate(WebAppStrategy.STRATEGY_NAME))

// Handle logout
app.get('/appid/logout',function(req,res){
    WebAppStrategy.logout(req)
    res.redirect('/')
    res.header('Acess-Control-Allow-Credentials','true')
    res.header('Access-Control-Allow-Origin', '*');
})

// Protect the whole app
//app.use(passport.authenticate(WebAppStrategy.STRATEGY_NAME))

app.use('/api',(req,res,next)=>{
    if(req.user)
    {
        next()
    }
    else{
        res.status(401).send("Unauthorized")
    }
})

app.get('/api/user',(req,res)=>{
  res.header('Acess-Control-Allow-Credentials','true')
  res.header('Access-Control-Allow-Origin', '*');
  console.log(req.user)
  if(req.user.picture)
  {
    res.json({
      user: {
          name: req.user.name,
          email: req.user.email,
          picture: req.user.picture
      }
    })
  }
  else{
    res.json({
      user: {
          name: req.user.name,
          email: req.user.email
      }
    })
  }
})

app.post('/notifications',(req,res)=>{
  req.header('Access-Control-Allow-Origin', '*');
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://kowndi:kowndi@6772@cluster0-wm2aj.mongodb.net/iitt_task?retryWrites=true&w=majority";
  MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("iitt_task");
  var email_val = req.body.link + ".files";
  dbo.collection(email_val).find().sort({ 'metadata.date': 1, 'metadata.time':1}).toArray(function (err,result) {
          if(err) 
          {
            err_msg = err
          }
          if(result)
          {
            if(result.length > 0)
            {
                var return_result = []
                for(var i=0;i<result.length;i++)
                {
                    return_result.push(result[i])
                }
                res.json({noti_msg: return_result})
            }
            else{
              res.json({noti_msg: null})
            }
          }
          db.close()
        })
  
      
  }) 
  
})
app.post('/pushnotifications',(req,res)=>{
  req.header('Access-Control-Allow-Origin', '*');
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://kowndi:kowndi@6772@cluster0-wm2aj.mongodb.net/iitt_task?retryWrites=true&w=majority";
  MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("iitt_task");
  var date = new Date();
  var dateStr = date.getFullYear() + "-"  + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + (date.getDate())).slice(-2);
  var query = { "metadata.date" : dateStr } 
  var collection_name = req.body.emailval.split(",")[0] + ".files"    
  dbo.collection(collection_name).find(query).sort({ 'metadata.time': 1}).toArray(function (err,result) 
  {
    if(err) 
    {
      err_msg = err
    }
    if(result)
    {
      if(result.length > 0)
      {            
      for(var i=0; i<result.length;i++)
      {
          var date = new Date();
          const currentTimeStamp = ("00" + date.getHours()).slice(-2) + ":" + ("00" + date.getMinutes()).slice(-2) 
          const timestamp = result[i].metadata.time;
          var t1 = new Date(dateStr+" "+ currentTimeStamp).getTime()
          var t2 = new Date(result[i].metadata.date+" "+timestamp).getTime()
          t2 = (t2-t1)/60000
          var gap = parseInt(result[i].metadata.notify_before.split(":")[1])
          console.log("Actual Gap:" + t2)
          console.log("Defined gap:" + gap)
          if(gap > t2)
          {
            if(req.body.emailval.split(",")[1] == 'false')
            {
              console.log('Notification Now!!')
              db.close()
              res.json({notify: result[i]}) 
              break;
            }
            else{
              console.log('Already Notified!!')
            }
          }
          else if(gap == t2)
          {
              console.log('Notification Now!!')
              db.close()
              res.json({notify: result[i]}) 
              break;
          }
          else
          {
            //res.json({notify: null})
          }
      }
      }
    }
  })     
  })
})
app.post('/upload',schedule.single('file'),(req,res)=>{
  req.header('Access-Control-Allow-Origin', '*');
  res.redirect('/?rm=Event Added Successfully!')  
})
app.post('/delEvent',(req,res)=>{
  req.header('Access-Control-Allow-Origin', '*');
  var list = req.body.emailval.split(",");
  var collection_name = list[0] + ".files"
  var id = list[1];
  var query_del = {"filename": id}
  var MongoClient = require('mongodb').MongoClient;
  var return_val = ""
  var url = "mongodb+srv://kowndi:kowndi@6772@cluster0-wm2aj.mongodb.net/iitt_task?retryWrites=true&w=majority";
  MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("iitt_task");
  console.log(query_del)
  dbo.collection(collection_name).deleteOne(query_del,function (err,result) {
  if (err) throw err;
  console.log(" 1 document(s) deleted");
  return_val = "Event deleted Successfully!"
  db.close();   
  })
  res.json({ delete_msg: return_val })
  })
})
app.get('/files/:email/:filename',(req,res)=>{
  res.header('Acess-Control-Allow-Credentials','true')
  res.header('Access-Control-Allow-Origin', '*');
  var url = "mongodb+srv://kowndi:kowndi@6772@cluster0-wm2aj.mongodb.net/iitt_task?retryWrites=true&w=majority";
  const connection = mongoose.createConnection(url,{useNewUrlParser:true,useUnifiedTopology:true})
  let gfs;
  var collection_name = req.params.email
  connection.once('open',()=>{
    gfs = GridFsStream(connection.db,mongoose.mongo)
    gfs.collection(collection_name)
    gfs.files.findOne({filename: req.params.filename},(err,file)=>{
      if(!file || file.length === 0)
      {  
        return res.status(404).json({
          err: 'No file exists' 
        })
      }
      const readstream = gfs.createReadStream(file.filename)
      return readstream.pipe(res) 
    })
  })
   
  })
app.get('/gallery/:email',(req,res)=>{
  res.header('Acess-Control-Allow-Credentials','true')
  res.header('Access-Control-Allow-Origin', '*');
  var url = "mongodb+srv://kowndi:kowndi@6772@cluster0-wm2aj.mongodb.net/iitt_task?retryWrites=true&w=majority";
  const connection = mongoose.createConnection(url,{useNewUrlParser:true,useUnifiedTopology:true})
  let gfs;
  var collection_name = req.params.email
  connection.once('open',()=>{
    gfs = GridFsStream(connection.db,mongoose.mongo)
    gfs.collection(collection_name)
    gfs.files.find().toArray((err,files)=>{
      if(!files || files.length === 0)
      {
        return res.status(404).json({
          err: 'No file exists' 
        })
      }
      return res.json(files) 
    })
  })
  })
app.get('/image/:email/:filename',(req,res)=>{
  res.header('Acess-Control-Allow-Credentials','true')
  res.header('Access-Control-Allow-Origin', '*');
  console.log(req.params)
  var url = "mongodb+srv://kowndi:kowndi@6772@cluster0-wm2aj.mongodb.net/iitt_task?retryWrites=true&w=majority";
  const connection = mongoose.createConnection(url,{useNewUrlParser:true,useUnifiedTopology:true})
  let gfs;
  var collection_name = req.params.email
  connection.once('open',()=>{
    gfs = GridFsStream(connection.db,mongoose.mongo)
    gfs.collection(collection_name)
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
      if(!file || file.length === 0)
      {
        return res.status(404).json({
          err: 'No file exists'
        })
      }
      if(file.contentType === 'image/jpeg' || file.contentType === 'image/png')
      {
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res)
      }
      else{
        res.status(404).json({
          err: 'Not an image'
        })
      }
    })
  })

})
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))