const express = require('express');
const { Search } = require('../controllers/searchController');
const searchRouter = express.Router();

searchRouter.get('', Search);

module.exports = searchRouter;