const userService = require('../services/userService');

exports.getArticles = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const articles = await userService.getAllArticles(skip, limit);
        const totalArticles = await userService.getArticlesCount();
        const totalPages = Math.ceil(totalArticles / limit);

        res.render('users/index', {
            articles,
            currentPage: page,
            totalPages,
            layout: './layouts/user'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Lỗi khi lấy bài viết.');
    }
};