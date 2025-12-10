import { Router, Request, Response, NextFunction } from 'express';
import productsController from '../controllers/productsController';

// Create router for products
const router = Router();

/**
 * @route GET /
 * @desc Get all products
 * @access Authenticated users only (enforced by middleware)
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productsController.getAllProducts();
    res.status(200).json({ products });
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /
 * @desc Create a new product
 * @access Authenticated users only (enforced by middleware)
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price } = req.body;
    if (
      !name ||
      typeof name !== 'string' ||
      !description ||
      typeof description !== 'string' ||
      typeof price !== 'number' ||
      price < 0
    ) {
      return res.status(400).json({ message: 'Invalid product data.' });
    }
    const product = await productsController.createProduct({
      name,
      description,
      price,
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
});

/**
 * @route PUT /:productId
 * @desc Update an existing product
 * @access Authenticated users only (enforced by middleware)
 */
router.put('/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, price } = req.body;
    if (
      !name ||
      typeof name !== 'string' ||
      !description ||
      typeof description !== 'string' ||
      typeof price !== 'number' ||
      price < 0
    ) {
      return res.status(400).json({ message: 'Invalid product data.' });
    }
    const updatedProduct = await productsController.updateProduct(req.params.productId, {
      name,
      description,
      price,
    });
    res.status(200).json({ product: updatedProduct });
  } catch (err) {
    next(err);
  }
});

/**
 * @route DELETE /:productId
 * @desc Delete a product
 * @access Authenticated users only (enforced by middleware)
 */
router.delete('/:productId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await productsController.deleteProduct(req.params.productId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;