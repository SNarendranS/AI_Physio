// Example schema
const mongoose = require('mongoose');

const MetaDataSchema = new mongoose.Schema({
  dataName: { type: String, required: true, unique: true },
  data: { type: Array, required: true }
});

module.exports = mongoose.model('Meta_Data', MetaDataSchema);
