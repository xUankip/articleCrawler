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

async function ArticleDetail(link) {
    try {
        const html = await request(link); // Lấy nội dung từ link gốc
        const $ = cheerio.load(html); // Load HTML

        const description = $('p.description').text().trim(); // Lấy mô tả từ thẻ p với class description
        const author = $('article.fck_detail p[style="text-align:right"]').text().trim(); // Lấy tên tác giả
        const thumbnail = $('article figure[data-size] img').attr('data-src'); // Lấy link ảnh từ thẻ img
        const content = $('article.fck_detail p').text().trim(); // Lấy nội dung từ các thẻ p

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
    try {
        const html = await request('https://vnexpress.net/khoa-hoc');
        const $ = cheerio.load(html); // Load HTML

        $('.title-news').each(async (index, el) => { // Lặp qua từng phần tử có class là title-news
            const title = $(el).find('a').text().trim(); // Lấy tiêu đề bài báo
            const originalLink = $(el).find('a').attr('href'); // Lấy link gốc của bài báo

            if (title && originalLink) {
                // Kiểm tra xem bài báo đã tồn tại trong DB chưa
                const existingArticle = await Article.findOne({ originalLink: originalLink });

                if (!existingArticle) {
                    const { description, author, thumbnail, content } = await ArticleDetail(originalLink);

                    const article = new Article({
                        title: title,
                        originalLink: originalLink,
                        description: description,
                        thumbnail: thumbnail,
                        content: content,
                        author: author
                    });

                    try {
                        await article.save();
                        console.log(`Saved article: ${title}`);
                    } catch (err) {
                        console.error(`Failed to save article: ${err.message}`);
                    }
                }
            } else {
                console.log(`Failed to process article: ${title}`);
            }
        });
    } catch (error) {
        console.error(`Failed to fetch articles list: ${error.message}`);
    }
});