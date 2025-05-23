import mongoose from 'mongoose';

const WallputtySchema = new mongoose.Schema(
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

const Wallputty = mongoose.model('Wallputty', WallputtySchema);
export default Wallputty;
