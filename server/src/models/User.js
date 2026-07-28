const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    // Not required — users signing in via Google will not have a local password
    password: {
      type: String,
      minlength: 8,
      select: false,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    // --- Music library relations ---
    favoriteTracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }],
    likedPlaylists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
    recentlyPlayed: [
      {
        track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track' },
        playedAt: { type: Date, default: Date.now },
      },
    ],

    // --- Third-party integrations ---
    spotify: {
      accessToken: { type: String, select: false },
      refreshToken: { type: String, select: false },
      expiresAt: { type: Date },
      connected: { type: Boolean, default: false },
      spotifyUserId: { type: String },
    },

    // --- Preferences ---
    preferences: {
      theme: { type: String, enum: ['dark', 'darker'], default: 'dark' },
      audioQuality: { type: String, enum: ['low', 'normal', 'high', 'lossless'], default: 'high' },
      downloadQuality: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
      equalizerPreset: { type: String, default: 'flat' },
      autoplay: { type: Boolean, default: true },
    },

    refreshTokens: [{ type: String, select: false }],
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, username: 1 });

// Hash password before saving, only if it was modified
UserSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshTokens;
  if (obj.spotify) {
    delete obj.spotify.accessToken;
    delete obj.spotify.refreshToken;
  }
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
