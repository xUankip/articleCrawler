const Article = require('../models/article');

exports.getAllArticles = async (skip, limit) => {
  return Article.find().skip(skip).limit(limit).sort({ createdAt: -1 }) ;
};
//Nếu muốn không hiển thị ở bảng admin thì thêm dòng này vào find()
// {status: { $in : ['approve', 'pending']}}

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
  return Article.findByIdAndUpdate(id, {status: 'deleted'}, {new: true});
};