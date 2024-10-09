const userRepository = require('../repositories/userRepository');

exports.getAllArticles = async (skip, limit) => {
    return await userRepository.getAllArticles(skip, limit);
};

exports.getArticlesCount = async () => {
    return await userRepository.getArticlesCount();
};