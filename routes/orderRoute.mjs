import express from 'express';
import Order from '../models/Order.mjs'; // Adjust path if needed
import PDFDocument from 'pdfkit';
import AdhesiveCement from '../models/AdhesiveCement.mjs';
import AdhesiveDiamond from '../models/AdhesiveDiamond.mjs';
import AdhesiveGold from '../models/AdhesiveGold.mjs';
import AdhesiveSilver from '../models/AdhesiveSilver.mjs';
import Wallputty from '../models/Wallputty.mjs';
import TileGrout from '../models/TileGrout.mjs'

const router = express.Router();

router.post('/place', async (req, res) => {
  try {
    const { user, products, totalPrice, payment } = req.body;

    if (!user || !products || products.length === 0 || !totalPrice) {
      return res.status(400).json({ message: 'Missing order data' });
    }

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      console.log(`Product ${i + 1}:`);
      console.log('productName:', product.productName);
      console.log('quantity:', product.quantity);
      console.log('pricePerKg:', product.pricePerKg);
      console.log('totalPrice:', product.totalPrice);
      if(product.productName==="Adhesive Diamond")
      {
        const o = await AdhesiveDiamond.findById('6822c386fb0c13967c144296');
        const a = o.quantity - product.quantity;
        const ab = await AdhesiveDiamond.findByIdAndUpdate('6822c386fb0c13967c144296', { quantity: a });
      }
      if(product.productName==="Adhesive Gold")
      {
        const o = await AdhesiveGold.findById('6824118ddc0fc29d524d3d24');
        const a = o.quantity - product.quantity;
        const ab = await AdhesiveGold.findByIdAndUpdate('6824118ddc0fc29d524d3d24', { quantity: a });
      }
      if(product.productName==="Tile Grout")
      {
        const o = await TileGrout.findById('6826fe2b1f9f3c099fbe0e48');
        const a = o.quantity - product.quantity;
        const ab = await TileGrout.findByIdAndUpdate('6826fe2b1f9f3c099fbe0e48', { quantity: a });
      }
      if(product.productName==="SASEN BUILD SHINE")
      {
        const o = await Wallputty.findById('681d0d6c815ae589d7adc925');
        const a = o.quantity - product.quantity;
        const ab = await Wallputty.findByIdAndUpdate('681d0d6c815ae589d7adc925', { quantity: a });
      }
      if(product.productName==="Adhesive Silver")
      {
        const o = await AdhesiveSilver.findById('682f3f14990d5a9f40da9395');
        const a = o.quantity - product.quantity;
        const ab = await AdhesiveSilver.findByIdAndUpdate('682f3f14990d5a9f40da9395', { quantity: a });
      }
    }

    const newOrder = new Order({
      user,
      products,
      totalPrice,
      payment,
    });

    await newOrder.save();

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error('Error saving order:', err);
    res.status(500).json({ message: 'Server error while placing order' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId });
    res.json({ orders });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.status(200).json({ orders });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Server error while fetching orders' });
  }
});

// PATCH /api/orders/:id
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json({ message: 'Status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

router.get('/pdf', async (req, res) => {
  try {
    const orders = await Order.find().populate('user');

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=all-orders.pdf');
    doc.pipe(res);

    const currentDate = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    doc.fontSize(22).text('SASEN Tile Fixing Solution', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Generated on: ${currentDate}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(18).text('All Orders Report', { align: 'center' });
    doc.moveDown();

    orders.forEach((order, index) => {
      doc.fontSize(14).text(`Order #${index + 1} - ID: ${order._id}`);
      doc.text(`User: ${order.user?.name}`);
      doc.text(`Total Price: ₹${order.totalPrice}`);
      doc.text(`Status: ${order.status}`);
      doc.text('Products:');
      order.products.forEach(p => {
        doc.text(`- ${p.productName}, ${p.quantity}kg – ₹${p.totalPrice}`);
      });
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate all orders PDF' });
  }
});

router.get('/pdf/:orderId', async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=order-${orderId}.pdf`);
    doc.pipe(res);

    const currentDate = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    doc.fontSize(22).text('SASEN Tile Fixing Solution', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Generated on: ${currentDate}`, { align: 'center' });
    doc.moveDown(1.5);

    doc.fontSize(18).text(`Order Details: #${orderId}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Order ID: ${orderId}`);
    doc.text(`User: ${order.user.name}`);
    doc.text(`Address: ${order.shippingAddress}`);
    doc.text(`Total Price: ₹${order.totalPrice}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown();

    doc.text('Products:', { underline: true });
    order.products.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.productName} – ${item.quantity}kg – ₹${item.totalPrice}`);
    });

    doc.end();

  } catch (err) {
    console.error('Error generating PDF', err);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

export default router;
