var express = require('express');
var router = express.Router();
router.post('/', function(req, res, next) {
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
      }
      }
    }
  })     
  })
});
module.exports = router;