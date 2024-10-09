const articleService = require('../services/articleService');

exports.getArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const articles = await articleService.getAllArticles(skip, limit);
    const totalArticles = await articleService.getArticlesCount();
    const totalPages = Math.ceil(totalArticles / limit);

    res.render('admin/articles/index', { articles, currentPage: page, totalPages });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi lấy bài viết.');
  }
};

// Form tạo bài viết mới
exports.createArticleForm = (req, res) => {
  res.render('admin/articles/create');
};

// Tạo bài viết mới
exports.createArticle = async (req, res) => {
  const articleData = req.body;
  await articleService.createArticle(articleData);
  res.redirect('/admin/articles');
};

exports.editArticleForm = async (req, res) => {
  try {
    const articleId = req.params.id;
    const article = await articleService.getArticleById(articleId);
    res.render('admin/articles/edit', { article });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi lấy bài viết để chỉnh sửa.');
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const articleId = req.params.id;
    const articleData = req.body;
    await articleService.updateArticle(articleId, articleData);
    res.redirect('/admin/articles');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi cập nhật bài viết.');
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const articleId = req.params.id;
    await articleService.deleteArticle(articleId);
    res.redirect('/admin/articles');
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi xóa bài viết.');
  }
};