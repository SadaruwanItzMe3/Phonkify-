const mongoose = require('mongoose');

/**
 * A Track is Phonkify's internal representation of a song. It normalizes
 * data pulled from Spotify (metadata) and YouTube (playable video source)
 * into a single playable entity.
 */
const TrackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    artist: { type: String, required: true, trim: true, index: true },
    album: { type: String, default: '' },
    durationMs: { type: Number, default: 0 },
    artworkUrl: { type: String, default: '' },

    genre: {
      type: String,
      enum: ['Phonk', 'Drift Phonk', 'Brazilian Phonk', 'Memphis Rap', 'Underground Trap', 'Other'],
      default: 'Phonk',
      index: true,
    },
    tags: [{ type: String }],

    // --- Source identifiers ---
    spotifyId: { type: String, index: true, sparse: true },
    youtubeVideoId: { type: String, index: true, sparse: true },

    // Auto-match confidence score (0-1) when a Spotify track was matched to
    // a YouTube video by the matching service
    matchConfidence: { type: Number, min: 0, max: 1, default: null },

    playCount: { type: Number, default: 0 },
    isExplicit: { type: Boolean, default: false },

    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

TrackSchema.index({ title: 'text', artist: 'text', album: 'text' });

module.exports = mongoose.model('Track', TrackSchema);
