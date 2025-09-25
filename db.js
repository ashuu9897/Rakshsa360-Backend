const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://ashuu9897_db_user:Sharma2004@hospitalbackend.0smzqg5.mongodb.net/hospital-admin?retryWrites=true&w=majority&appName=HospitalBackend';

mongoose.connect(mongoURI, {
  // useNewUrlParser and useUnifiedTopology are deprecated and can be removed
})
.then(() => {
  console.log('MongoDB connected successfully');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
});

module.exports = mongoose;
