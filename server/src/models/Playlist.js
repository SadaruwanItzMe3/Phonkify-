const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, default: '', maxlength: 300 },
    coverImageUrl: { type: String, default: '' },

    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    tracks: [
      {
        track: { type: mongoose.Schema.Types.ObjectId, ref: 'Track', required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    isPublic: { type: Boolean, default: false },
    isCollaborative: { type: Boolean, default: false },
    shareSlug: { type: String, unique: true, sparse: true, index: true },

    // Marks system-generated playlists like Discover Weekly / Daily Mix
    isSystemGenerated: { type: Boolean, default: false },
    systemType: {
      type: String,
      enum: ['discover-weekly', 'daily-mix', 'mood', null],
      default: null,
    },

    // Imported from an external Spotify playlist
    importedFrom: {
      provider: { type: String, enum: ['spotify', null], default: null },
      externalId: { type: String, default: null },
    },
  },
  { timestamps: true }
);

PlaylistSchema.index({ owner: 1, name: 1 });

module.exports = mongoose.model('Playlist', PlaylistSchema);
