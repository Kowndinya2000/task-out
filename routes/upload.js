var express = require('express')
require('dotenv').config();
const nodemailer = require('nodemailer');
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
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: 'cs17b032@iittp.ac.in',
          pass: 'I1t@googlechrome'
      }
  });

  let mailOptions = {
      from: 'cs17b032@iittp.ac.in',
      to: req.body.email2,
      subject:'An event lined up! [Title]: '+req.body.title + ' On ' + req.body.date + ' At: [' + req.body.time + ']' ,
      html: '<!DOCTYPE html><html><head></head><body style="background-color: #f2f2f2;font-family: \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif;"><div style="font-size: 2rem;text-align: center;background: #333333;font-family: \'Lucida Sans\', \'Lucida Sans Regular\', \'Lucida Grande\', \'Lucida Sans Unicode\', Geneva, Verdana, sans-serif;color: #456FFF;">Event Notification from Task-Out</div><h2 style="color: #7b7b7b">Hello ' + req.body.email2 +', this is<span style="color: #456FFF;">' + ' ' + 'You have an event scheduled! On ' + req.body.date + '</span></h2><h4 style="color: #7b7b7b">'+ '[Title]: ' + req.body.title +'</h4><h2 style="font-style: italic;">Links to Event Resources</h2><div style="border-left: 5px solid #456fff;border-radius: 1rem;border-right: 5px solid #456fff;padding: 0.5rem;margin-bottom: 1rem;"> ' + 'Link: [' + req.body.link  + ']' +  '</div><h2 style="font-style: italic;">Event Notes: </h2><div style="border-left: 5px solid #456fff;border-radius: 1rem;border-right: 5px solid #456fff;padding: 0.5rem;">' + req.body.note + '</div><h2 style="display: inline-block;"></a></h2><h2 style="display: inline-block;margin-left: 2rem;"><a href='+ req.body.link +' style="color:darkblue">Event Resource Link</a></a></h2></body></html>',
  };
  transporter.sendMail(mailOptions,function(err,data){
      if(err)
      {
          console.log(err);
          res.json({message: "Email not Sent :(" + err});

      }
      else{
          console.log('Email sent successfully');
          res.json({message: "Email Sent Successfully"});

      }
  });
    res.redirect('/?rm=Event Added Successfully! An email has been sent!')
});

module.exports = router;
