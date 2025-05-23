import mongoose from 'mongoose';

const AdhesiveDiamondSchema = new mongoose.Schema(
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

const AdhesiveDiamond = mongoose.model('AdhesiveDiamond', AdhesiveDiamondSchema);
export default AdhesiveDiamond;
