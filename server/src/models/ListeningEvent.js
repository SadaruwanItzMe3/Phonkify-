const mongoose = require('mongoose');

/**
 * Individual listening events, used to power analytics, recently-played,
 * and the recommendation engine (mood-based playlists, Discover Weekly, etc).
 */
const ListeningEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true, index: true },
    msPlayed: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    source: { type: String, enum: ['search', 'playlist', 'discover', 'artist', 'queue'], default: 'search' },
  },
  { timestamps: true }
);

ListeningEventSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ListeningEvent', ListeningEventSchema);
