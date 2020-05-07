var express = require('express')
var GridFsStream = require('gridfs-stream')
var methodOverride = require('method-override')
var mongoose = require('mongoose')
var router = express.Router();
router.use(methodOverride('_method'))
router.get('/:email', function(req, res, next) {
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
    
    
});

module.exports = router;