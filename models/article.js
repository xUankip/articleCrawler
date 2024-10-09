const mongoose = require('mongoose')
const Schema = mongoose.Schema

const articleSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 100,
    },
    slug : String,
    originalLink : String,
    category: String,
    description : String,
    thumbnail : String,
    content :{
        type: String,
        required: true,
    },
    author : {
        type : String,
        required: true,
    },
    createdAt : {
        type : Date,
        default: Date.now
    },
    updatedAt : Date,
    status : {
        type: String,
        enum: ['approve', 'pending', 'deleted'],
        default: 'pending'
    }
});

function slugify(text) {
    function removeVietnameseTones(str) {
        str = str.normalize('NFD'); // Chuẩn hóa chuỗi Unicode
        str = str.replace(/[\u0300-\u036f]/g, ''); // Loại bỏ dấu tiếng Việt
        str = str.replace(/đ/g, 'd').replace(/Đ/g, 'D'); // Chuyển đổi đ -> d
        return str;
    }

    // Loại bỏ dấu tiếng Việt trước khi tiếp tục xử lý slug
    const textWithoutTones = removeVietnameseTones(text);

    // Chuyển đổi chuỗi thành slug
    return textWithoutTones.toLowerCase() // Chuyển sang chữ thường
        .replace(/[^\w\s-]/g, '')  // Loại bỏ các ký tự đặc biệt, giữ lại chữ, số và dấu cách
        .replace(/\s+/g, '-')      // Chuyển khoảng trắng thành dấu gạch ngang
        .replace(/^-|-$/g, '');    // Loại bỏ dấu gạch ngang ở đầu và cuối chuỗi
}


  articleSchema.pre('save', function (next) {
    if (!this.slug && this.title) {
      this.slug = slugify(this.title);
    }
    next();
  });


module.exports = mongoose.model('Article', articleSchema)