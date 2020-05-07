var express = require('express');
var GridFsStream = require('gridfs-stream')
var methodOverride = require('method-override')
var mongoose = require('mongoose')
var router = express.Router();
router.use(methodOverride('_method'))
router.get('/:email/:filename', function(req, res, next) {
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
    
    
});

module.exports = router;