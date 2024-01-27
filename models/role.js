const mongoose = require('mongoose');
const { Snowflake } = require('@theinternetfolks/snowflake');

const roleSchema = new mongoose.Schema({
  id: { type: String, required: true, default: Snowflake.generate },
  name: { type: String, required: true, unique: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;