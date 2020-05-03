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
    gfs.collection('uploads')
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
      const filename = buf.toString('hex') + path.extname(file.originalname)
      req.body.filei = filename
      const fileInfo = {
          filename: filename,
          metadata: {email:req.body.email2, 
            date: req.body.date, 
            time: req.body.time,
            endTime: req.body.endTime,
            title: req.body.title,
            notify_before: req.body.notify_before,
            location: req.body.location,
            note: req.body.note},
        bucketName: 'uploads'
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
    redirectUri: "http://localhost:3000/appid/callback"
}))

app.get('/',(req,res)=>{
  res.render('index',{
    return_message:req.query.rm,
    noti_msg:req.query.noti_list,
    notify: req.query.notify_now})
})
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
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://kowndi:kowndi@6772@cluster0-wm2aj.mongodb.net/iitt_task?retryWrites=true&w=majority";
  MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
  if (err) throw err;
  var dbo = db.db("iitt_task");
  var date = new Date();
  var dateStr = date.getFullYear() + "-"  + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + (date.getDate())).slice(-2);
  var query = { "metadata.date" : dateStr } 
  dbo.collection("uploads.files").find(query).sort({ 'metadata.time': 1}).toArray(function (err,result) {
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
                  if(result[i].metadata.email == req.body.link)
                  {
                    return_result.push(result[i])
                  }
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
  var bool1 = false;var ID;
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb+srv://kowndi:kowndi@6772@cluster0-wm2aj.mongodb.net/iitt_task?retryWrites=true&w=majority";
  MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  var dbo = db.db("iitt_task");
  var date = new Date();
  var dateStr = date.getFullYear() + "-"  + ("00" + (date.getMonth() + 1)).slice(-2) + "-" + ("00" + (date.getDate())).slice(-2);
  var query = { "metadata.date" : dateStr } 
  if(!bool1)
  {
    dbo.collection("uploads.files").find(query).sort({ 'metadata.time': 1}).toArray(function (err,result) 
  {
    if(err) 
    {
      err_msg = err
    }
    console.log(result.length);
    if(result.length == 0)
    {
      res.json({notify: 'No Notifications Yet!'}) 
    }
    else if(result.length > 0)
    {            
    for(var i=0; i<result.length;i++)
    {
      if(result[i].metadata.email == req.body.emailval)
      {
        var date = new Date();
        const currentTimeStamp = ("00" + date.getHours()).slice(-2) + ":" + ("00" + date.getMinutes()).slice(-2) 
        const timestamp = result[i].metadata.time;
        console.log( "TimeStampDB: " +timestamp)
        console.log("Current Time Stamp: " + currentTimeStamp)
        if(timestamp == currentTimeStamp)
        {
            ID = result[i].filename;
            console.log(ID)
            console.log('Notification Now!!')
            const WindowsToaster = require('node-notifier').WindowsToaster;
            var notifier = new WindowsToaster({
              withFallback: false, 
              customPath: undefined
            });
              notifier.notify({
                title: result[i].metadata.title,
                message: result[i].metadata.note,
                icon: path.join(__dirname, '/images/img-01.png') ,
                contentImage: path.join(__dirname, '/images/img-01.png'),
                'app-name': 'Task Management App, IITTP',
                appID: "task-out-appid",
                urgency: undefined,
                time: result[i].metadata.time,  
                category: undefined,
                hint: undefined,
                sound: true},
                function(err, response) {
                  // Response is response from notification
                }
              );
              
              notifier.on('click', function(notifierObject, options, event) {
                // Triggers if `wait: true` and user clicks notification
              });
              
              notifier.on('timeout', function(notifierObject, options) {
                // Triggers if `wait: true` and notification closes
              });
              bool1 = true;
              console.log(bool1)
              db.close()
              
              break;
        }
      }            
    }
    }
    
    })     
  }
  if(bool1)
  {
      var query_del = {"filename" : ID}
      console.log(query_del)
      dbo.collection("uploads.files").deleteOne(query_del,function (err,result) {
      if (err) throw err;
      console.log(result.n + " document(s) deleted");
      db.close();   
  })
    bool1 = false;
  }
  })
  res.json({notify: 'Notification Now!'})      
})
app.post('/upload',schedule.single('file'),(req,res)=>{
  res.redirect('/?rm=Event Added Successfully!')  
})
app.get('/files/:filename',(req,res)=>{
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
app.get('/gallery',(req,res)=>{
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
app.get('/image/:filename',(req,res)=>{
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
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))