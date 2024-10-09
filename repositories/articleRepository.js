const Article = require('../models/article');

exports.getAllArticles = async (skip, limit) => {
  return Article.find().skip(skip).limit(limit);
};

exports.getArticlesCount = async () => {
  return Article.countDocuments();
};

exports.createArticle = (articleData) => {
  const article = new Article(articleData);
  return article.save();
};

exports.getArticleById = (id) => {
  return Article.findById(id);
};

exports.findArticleByTitle = (title) => {
  return Article.find({title : title})
};

exports.updateArticle = (id, articleData) => {
  return Article.findByIdAndUpdate(id, articleData, { new: true });
};

exports.deleteArticle = (id) => {
  return Article.findByIdAndDelete(id);
};