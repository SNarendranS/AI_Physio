const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true, lowercase: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    passwordCheck: { type: String },
    phoneNumber: { type: String, unique: true, maxlength: 10 },
    profile: { data: Buffer, contentType: String },
    dob: { type: Date, required: true },
    age: { type: Number }, // auto-calculated
    gender: { type: String, required: true, enum: ['male', 'female'] }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {

    // 🔐 Password hashing (existing logic)
    if (this.isModified('password')) {
        this.passwordCheck = this.password;
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // 🎂 Auto-calculate age when DOB changes or on create
    if (this.isModified('dob')) {
        const today = new Date();
        const birthDate = new Date(this.dob);

        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
        ) {
            age--;
        }

        this.age = age;
    }
    UserSchema.pre('findOneAndUpdate', function (next) {
        const update = this.getUpdate();

        if (update.dob) {
            const today = new Date();
            const birthDate = new Date(update.dob);

            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (
                monthDiff < 0 ||
                (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
                age--;
            }

            update.age = age;
            this.setUpdate(update);
        }

        next();
    });

    next();
});


// Method to compare password
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('User', UserSchema);