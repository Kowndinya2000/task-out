var express = require('express');
var router = express.Router();
router.post('/', function(req, res, next) {
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
              return  res.json({noti_msg: return_result})
            }
            else{
             return res.json({noti_msg: null})
            }
          }
          db.close()
        })
  }) 

});

module.exports = router;
