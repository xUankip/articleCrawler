const cheerio = require('cheerio');
const request = require('request-promise');
const mongoose = require('mongoose');
const Article = require('./models/article');
const cron = require('node-cron');

mongoose.connect('mongodb://localhost:27017/article', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

// Hàm lấy chi tiết bài viết từ link gốc
async function ArticleDetail(link, source) {
    try {
        const html = await request(link);
        const $ = cheerio.load(html);

        let description, author, thumbnail, content;

        if (source === 'vnexpress') {
            description = $('p.description').text().trim();
            author = $('article.fck_detail p[style="text-align:right"]').text().trim();
            thumbnail = $('article figure[data-size] img').attr('data-src');
            content = $('article.fck_detail p').text().trim();
        } else if (source === 'vietnamnet') {
            description = $('.content-detail-sapo').text().trim();
            author = $('.article-detail-author__main span.name a').text().trim();
            thumbnail = $('div.maincontent figure.image picture img').attr('srcset');
            content = $('div.maincontent p').text().trim();
        }

        return {
            description: description || "Không có mô tả",
            author: author || "Không có tác giả",
            thumbnail: thumbnail || "Không có ảnh",
            content: content || "Không có nội dung"
        };
    } catch (error) {
        console.error(`Failed to fetch article detail: ${error.message}`);
        return {
            description: "Không lấy được mô tả",
            author: "Không lấy được tác giả",
            thumbnail: "Không lấy được ảnh",
            content: "Không lấy được nội dung"
        };
    }
}

cron.schedule('*/30 * * * * *', async () => {
    console.log('Running the scraping job...');

    // craw từ vnexpress
    try {
        const html = await request('https://vnexpress.net/khoa-hoc');
        const $ = cheerio.load(html);

        $('.title-news').each(async (index, el) => {
            const title = $(el).find('a').text().trim();
            const originalLink = $(el).find('a').attr('href');

            if (title && originalLink) {
                const existingArticle = await Article.findOne({ originalLink: originalLink });

                if (!existingArticle) {
                    const { description, author, thumbnail, content } = await ArticleDetail(originalLink, 'vnexpress');

                    const article = new Article({
                        title: title,
                        originalLink: originalLink,
                        description: description,
                        thumbnail: thumbnail,
                        content: content,
                        author: author,
                        category: 'Tin tức tự động'
                    });

                    try {
                        await article.save();
                        console.log(`Saved article from vnexpress: ${title}`);
                    } catch (err) {
                        console.error(`Failed to save article: ${err.message}`);
                    }
                }
            }
        });
    } catch (error) {
        console.error(`Failed to fetch articles list from vnexpress: ${error.message}`);
    }

    // craw từ vietnamnet
    try {
        const baseURL = 'https://vietnamnet.vn';
        const html = await request(`${baseURL}/the-gioi`);
        const $ = cheerio.load(html);

        $('.verticalPost__main-title').each(async (index, el) => {
            const title = $(el).find('a').text().trim();
            let originalLink = $(el).find('a').attr('href');

            if (title && originalLink) {
                if (!originalLink.startsWith('http')) {
                    originalLink = baseURL + originalLink;
                }

                const existingArticle = await Article.findOne({ originalLink: originalLink });

                if (!existingArticle) {
                    const { description, author, thumbnail, content } = await ArticleDetail(originalLink, 'vietnamnet');

                    const article = new Article({
                        title: title,
                        originalLink: originalLink,
                        description: description,
                        thumbnail: thumbnail,
                        content: content,
                        author: author,
                        category: 'Tin tức tự động'
                    });

                    try {
                        await article.save();
                        console.log(`Saved article from vietnamnet: ${title}`);
                    } catch (err) {
                        console.error(`Failed to save article: ${err.message}`);
                    }
                }
            }
        });
    } catch (error) {
        console.error(`Failed to fetch articles list from vietnamnet: ${error.message}`);
    }
});