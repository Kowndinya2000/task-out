var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index',{
    return_message:req.query.rm,
    noti_msg:req.query.noti_list,
    notify: req.query.notify_now})
});

module.exports = router;
