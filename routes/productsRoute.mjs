import express from 'express';
import multer from 'multer'; // For handling file uploads
import path from 'path';
import PDFDocument from 'pdfkit';
import AdhesiveCement from '../models/AdhesiveCement.mjs';
import AdhesiveDiamond from '../models/AdhesiveDiamond.mjs';
import AdhesiveGold from '../models/AdhesiveGold.mjs';
import AdhesiveSilver from '../models/AdhesiveSilver.mjs';
import TileGrout from '../models/TileGrout.mjs';
import Wallputty from '../models/Wallputty.mjs';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Route to add product based on productType
router.post('/api/products', upload.single('image'), async (req, res) => {
  const { name, description, quantity, price, productType } = req.body;
  const image = req.file ? req.file.filename : null;

  let product;

  // Dynamically select model based on productType
  switch (productType) {
    case 'adhesiveSilver':
      product = new AdhesiveSilver({ name, description, quantity, price, image });
      break;
    case 'adhesiveGold':
      product = new AdhesiveGold({ name, description, quantity, price, image });
      break;
    case 'adhesiveDiamond':
      product = new AdhesiveDiamond({ name, description, quantity, price, image });
      break;
    case 'adhesiveCement':
      product = new AdhesiveCement({ name, description, quantity, price, image });
      break;
    case 'tileGrout':
      product = new TileGrout({ name, description, quantity, price, image });
      break;
    case 'wallPutty':
      product = new Wallputty({ name, description, quantity, price, image });
      break;
    default:
      return res.status(400).json({ message: 'Invalid product type' });
  }

  try {
    await product.save();
    res.status(201).json({ message: `${productType} added successfully!` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add product', error: err.message });
  }
});

router.get('/api/products/all', async (req, res) => {
  try {
    const adhesiveDiamond = await AdhesiveDiamond.find();
    const adhesiveGold = await AdhesiveGold.find();
    const adhesiveSilver = await AdhesiveSilver.find();
    const wallputty = await Wallputty.find();
    const tileGrout = await TileGrout.find();

    res.json({
      adhesiveDiamond,
      adhesiveGold,
      adhesiveSilver,
      wallputty,
      tileGrout,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
});

// Route: Get Adhesives
router.get('/api/products/adhesives', async (req, res) => {
  try {
    const adhesiveDiamond = await AdhesiveDiamond.find();
    const adhesiveGold = await AdhesiveGold.find();
    const adhesiveSilver = await AdhesiveSilver.find();
    const adhesiveCement = await AdhesiveCement.find();

    res.json({
      adhesiveDiamond,
      adhesiveGold,
      adhesiveSilver,
      adhesiveCement,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching adhesives', error: err.message });
  }
});

router.get('/api/products/pdf', async (req, res) => {
  try {
    const [
      adhesiveDiamond,
      adhesiveGold,
      adhesiveSilver,
      wallputty,
      tileGrout,
    ] = await Promise.all([
      AdhesiveDiamond.find(),
      AdhesiveGold.find(),
      AdhesiveSilver.find(),
      Wallputty.find(),
      TileGrout.find(),
    ]);

    const allProducts = [
      ...adhesiveDiamond.map(p => ({ ...p._doc, category: 'Adhesive - Diamond' })),
      ...adhesiveGold.map(p => ({ ...p._doc, category: 'Adhesive - Gold' })),
      ...adhesiveSilver.map(p => ({ ...p._doc, category: 'Adhesive - Silver' })),
      ...wallputty.map(p => ({ ...p._doc, category: 'Wall Putty' })),
      ...tileGrout.map(p => ({ ...p._doc, category: 'Tile Grout' })),
    ];

    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=products.pdf');
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

    doc.fontSize(18).text('All Products Report', { align: 'center' });
    doc.moveDown();

    allProducts.forEach((product, index) => {
      doc.fontSize(12).text(`${index + 1}. ${product.name}`);
      doc.text(`   Category: ${product.category}`);
      doc.text(`   Price: ₹${product.price}`);
      doc.text(`   Description: ${product.description || 'N/A'}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    console.error('Error generating product PDF:', err);
    res.status(500).json({ message: 'Failed to generate products PDF' });
  }
});

// Route: Get Wallputty
router.get('/api/products/wallputty', async (req, res) => {
  try {
    const wallputty = await Wallputty.find();
    res.json(wallputty);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching wallputty', error: err.message });
  }
});

// Route: Get Tile Grout
router.get('/api/products/tilegrout', async (req, res) => {
  try {
    const tileGrout = await TileGrout.find();
    res.json(tileGrout);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tile grout', error: err.message });
  }
});

router.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  const models = [
    AdhesiveSilver,
    AdhesiveGold,
    AdhesiveDiamond,
    AdhesiveCement,
    TileGrout,
    Wallputty,
  ];

  for (const Model of models) {
    try {
      const product = await Model.findById(id);
      if (product) {
        return res.json({
          ...product._doc,
          modelName: Model.modelName, // include model name for patching
        });
      }
    } catch (err) {
      // If ID format is invalid for this model, just skip
      continue;
    }
  }

  return res.status(404).json({ message: 'Product not found in any model.' });
});

router.patch('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const models = [
    AdhesiveSilver,
    AdhesiveGold,
    AdhesiveDiamond,
    AdhesiveCement,
    TileGrout,
    Wallputty,
  ];

  for (const Model of models) {
    try {
      const updated = await Model.findByIdAndUpdate(id, updateData, { new: true });
      if (updated) {
        return res.json({ message: 'Product updated successfully', updated });
      }
    } catch (err) {
      continue;
    }
  }

  return res.status(404).json({ message: 'Product not found for update.' });
});

// Route to remove product based on id
router.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  const models = [
    AdhesiveSilver,
    AdhesiveGold,
    AdhesiveDiamond,
    AdhesiveCement,
    TileGrout,
    Wallputty,
  ];

  // Loop through each model and try to find and delete the product
  for (const Model of models) {
    try {
      const product = await Model.findById(id);
      if (product) {
        await Model.findByIdAndDelete(id);  // Delete the product
        return res.status(200).json({ message: 'Product deleted successfully.' });
      }
    } catch (err) {
      // Skip to the next model if error occurs
      continue;
    }
  }

  // If no product is found in any model
  return res.status(404).json({ message: 'Product not found in any model.' });
});

export default router;
