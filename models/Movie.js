import mongoose from 'mongoose';

const MovieSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tmdbId: { type: Number, required: true },
  title: { type: String, required: true, trim: true, maxlength: 250 },
  overview: { type: String, default: '', maxlength: 6000 },
  releaseDate: { type: String, default: '' },
  genres: { type: [String], default: [] },
  posterUrl: { type: String, default: '' },
  posterSource: { type: String, enum: ['tmdb', 'custom'], default: 'tmdb' },
  status: { type: String, enum: ['to_watch', 'watching', 'done'], default: 'to_watch' },
  rating: { type: Number, min: 1, max: 10, default: null },
  notes: { type: String, maxlength: 500, default: '' },
}, { timestamps: true });

MovieSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });
export default mongoose.models.Movie || mongoose.model('Movie', MovieSchema);
