const mongoose = require('mongoose');
const { Snowflake } = require('@theinternetfolks/snowflake');

const memberSchema = new mongoose.Schema({
  id: { type: String, required: true, default: Snowflake.generate },
  community: { type: String, required: true, unique: true },
  user: { type: String, required: true, unique: true },
  role: { type: String, required: true, unique: true },
  created_at: { type: Date, default: Date.now },
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;