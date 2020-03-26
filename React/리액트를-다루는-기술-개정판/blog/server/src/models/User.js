const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: String,
  hashedPassword: String
});

UserSchema.methods.setPassword = async function(password) {
  const hash = await bcrypt.hash(password, Number(process.env.SALT_ROUNDS));
  this.hashedPassword = hash;
};

UserSchema.methods.checkPassword = async function(password) {
  const result = await bcrypt.compare(password, this.hashedPassword);
  return result;
};

UserSchema.methods.serialize = function() {
  const data = this.toJSON();
  delete data.hashedPassword;

  return data;
};

UserSchema.methods.generateToken = function() {
  const token = jwt.sign(
    {
      _id: this.id,
      username: this.username
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: '7d'
    }
  );

  return token;
};

UserSchema.statics.findByUsername = function(username) {
  return this.findOne({ username });
};

module.exports = mongoose.model('User', UserSchema);
