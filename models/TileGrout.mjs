import mongoose from 'mongoose';

const TileGroutSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    quantity: Number,
    price: {
      type: Number,
      required: true,
    },
    image: String,
  },
  {
    timestamps: true,
  }
);

const TileGrout = mongoose.model('TileGrout', TileGroutSchema);
export default TileGrout;
