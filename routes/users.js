var express = require('express');
const userController = require("../controllers/userController");
var router = express.Router();

/* GET users listing. */
router.get ('/', userController.getArticles);
module.exports = router;
