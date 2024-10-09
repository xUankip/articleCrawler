const articleRepository = require('../repositories/articleRepository');

exports.getAllArticles = async (skip, limit) => {
  return await articleRepository.getAllArticles(skip, limit);
};

exports.getArticlesCount = async () => {
  return await articleRepository.getArticlesCount();
};

exports.createArticle = async (articleData) => {
  // // const existingArticle = await articleRepository.findArticleByTitle(articleData.title);
  // if (existingArticle) {
  //   throw new Error('Tiêu đề đã tồn tại');
  // }
  return articleRepository.createArticle(articleData);
};

exports.getArticleById = (id) => {
  return articleRepository.getArticleById(id);
};

exports.updateArticle = (id, articleData) => {
  return articleRepository.updateArticle(id, articleData);
};

exports.deleteArticle = (id) => {
  return articleRepository.deleteArticle(id);
};