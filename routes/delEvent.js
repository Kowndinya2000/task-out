var express = require('express');
var router = express.Router();
router.post('/', function(req, res, next) {
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
    
    
});

module.exports = router;


