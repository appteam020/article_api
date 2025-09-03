const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAT: {
    type: Date,
    default: Date.now,
    required: true
  }
});

module.exports = mongoose.model('article', ArticleSchema);
