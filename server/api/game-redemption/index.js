'use strict';

var express = require('express');
var controller = require('./gameredemption.controller');

var router = express.Router();

router.post('/', controller.submit);
router.get('/', controller.index);

module.exports = router;