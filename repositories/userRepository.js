const Article = require('../models/article');

exports.getAllArticles = async (skip, limit) => {
    return Article.find().skip(skip).limit(limit);
};

exports.getArticlesCount = async () => {
    return Article.countDocuments();
};