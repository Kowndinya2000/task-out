var express = require('express')

var GridFsStorage = require('multer-gridfs-storage')
var path = require('path')
var crypto = require('crypto')
var multer = require('multer')
var methodOverride = require('method-override')
var router = express.Router();

var url = "mongodb+srv://kowndi:kowndi@6772@cluster0-wm2aj.mongodb.net/iitt_task?retryWrites=true&w=majority";
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
router.use(methodOverride('_method'))
router.post('/',schedule.single('file'), function(req, res, next) {
    res.redirect('/?rm=Event Added Successfully!')
});

module.exports = router;
