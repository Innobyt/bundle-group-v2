'use strict';

var express = require('express');
var controller = require('./gamebundle.controller');

var router = express.Router();

router.post('/', controller.create);
router.get('/', controller.index);
router.get('/:id', controller.show);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

// others
router.post('/claim', controller.claim);

module.exports = router;