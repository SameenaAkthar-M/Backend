import mongoose from 'mongoose';

const AdhesiveCementSchema = new mongoose.Schema(
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

const AdhesiveCement = mongoose.model('AdhesiveCement', AdhesiveCementSchema);
export default AdhesiveCement;
