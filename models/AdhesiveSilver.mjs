import mongoose from 'mongoose';

const AdhesiveSilverSchema = new mongoose.Schema(
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

const AdhesiveSilver = mongoose.model('AdhesiveSilver', AdhesiveSilverSchema);
export default AdhesiveSilver;
