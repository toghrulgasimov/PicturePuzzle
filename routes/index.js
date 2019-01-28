var express = require('express');
var router = express.Router();
let fs = require('fs');
/* GET home page. */
router.get('/', function(req, res, next) {
   let s = fs.readFileSync("./public/indexx.html") + "";
   res.send(s);
});

module.exports = router;
