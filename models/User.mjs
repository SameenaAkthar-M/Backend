import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    area:{type:String,required:true},
    address:{type:String,required:true},
    refreshToken: { type: String },
    role:{type:String,default: 'user' }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
