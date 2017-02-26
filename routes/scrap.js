var express = require('express');
var router = express.Router();
var scrapController = require('../controllers/scrap.js');

/*
 * GET
 */
router.get('/', scrapController.list);

/*
 * GET
 */
router.get('/create', scrapController.create);

/*
 * GET
 */
router.get('/show/:id', scrapController.show);

/*
 * GET
 */
router.get('/update/:id', scrapController.update);

/*
 * GET
 */
router.get('/delete/:id', scrapController.delete);

/*
 * GET
 */
router.get('/request', scrapController.request);

/*
 * POST
 */
router.post('/process', scrapController.process);


module.exports = router;
