import mongoose from 'mongoose';

const AdhesiveGoldSchema = new mongoose.Schema(
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

const AdhesiveGold = mongoose.model('AdhesiveGold', AdhesiveGoldSchema);
export default AdhesiveGold;
