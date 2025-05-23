import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    products: [ // Array of products within an order
        {
            productName: { 
                type: String, 
                required: true 
            },
            quantity: { 
                type: Number, 
                required: true 
            },
            pricePerKg: { 
                type: Number, 
                required: true 
            },
            totalPrice: { 
                type: Number, 
                required: true
            }
        }
    ],
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: { 
        type: String, 
        default: 'Shipped' // Default status is 'Shipped'
    },
    payment: { 
        type: String 
    },
    totalPrice: { 
        type: Number, // Field for the total price of the order
        required: true
    },
    placedAt: { 
        type: Date, 
        default: Date.now 
    },
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
