const cheerio = require('cheerio');
const request = require('request-promise');
const mongoose = require('mongoose');
const Article = require('./models/article');
const cron = require('node-cron');
mongoose.connect('mongodb://localhost:27017/article');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
});

async function ArticleDetail(link) {
    try {
        const html = await request(link); // Lấy nội dung từ link gốc
        const $ = cheerio.load(html); // Load HTML

        const description = $('.content-detail-sapo').text().trim(); // Lấy mô tả từ thẻ p với class description
        const author = $('.article-detail-author__main span.name a').text().trim(); // Lấy tên tác giả
        const thumbnail = $('div.maincontent figure.image picture img').attr('srcset'); // Lấy link ảnh từ thẻ img
        const content = $('div.maincontent p').text().trim(); // Lấy nội dung từ các thẻ p

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
        const baseURL = 'https://vietnamnet.vn'; // Tên miền gốc của trang web
        const html = await request(`${baseURL}/the-gioi`); // Trang nguồn
        const $ = cheerio.load(html); // Load HTML

        $('.verticalPost__main-title').each(async (index, el) => {
            const title = $(el).find('a').text().trim(); // Lấy tiêu đề bài báo
            let originalLink = $(el).find('a').attr('href'); // Lấy link gốc của bài báo

            if (title && originalLink) {
                // Nếu link là đường dẫn tương đối, thêm tên miền gốc vào
                if (!originalLink.startsWith('http')) {
                    originalLink = baseURL + originalLink;
                }

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