const express = require('express');
const { createModel, editModel, GetModel, GetSingleModel, DeleteModel } = require('../controllers/modelsController');
const { upload } = require('../middlewares/uploadimage');
const auth = require('../middlewares/auth');
const { model } = require('mongoose');
const modelRouter = express.Router();

modelRouter.post('/',auth,upload.single('image'),createModel);
modelRouter.put('/:modelid',auth,upload.single('image'),editModel);
modelRouter.delete('/:modelid',auth,DeleteModel);
modelRouter.get('/',GetModel);
modelRouter.get('/:modelid',GetSingleModel);

module.exports = modelRouter;