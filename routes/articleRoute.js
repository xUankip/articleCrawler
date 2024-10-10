const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const userController = require('../controllers/userController');

/* GET articles listing. */
router.get('/', async (req, res) => {
  await articleController.getArticles(req, res);
});
router.get('/users', async (req, res) => {
  await userController.getArticles(req, res);
});

// Create article
router.get('/create', articleController.createArticleForm);
router.post('/create', articleController.createArticle);

// Edit article
router.get('/edit/:id', articleController.editArticleForm);
router.post('/edit/:id', articleController.updateArticle);

// Delete article
router.post('/delete/:id', articleController.deleteArticle);


module.exports = router;
