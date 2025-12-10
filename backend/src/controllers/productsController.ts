import { getRepository } from 'typeorm';
import { Product } from '../models/Product';

/**
 * Business logic for product CRUD operations.
 */
const productsController = {
  /**
   * Get all products.
   * @returns Array of products
   */
  async getAllProducts(): Promise<Product[]> {
    const repo = getRepository(Product);
    return await repo.find({ order: { createdAt: 'DESC' } });
  },

  /**
   * Create a new product.
   * @param data Product data
   * @returns Created product
   */
  async createProduct(data: {
    name: string;
    description: string;
    price: number;
  }): Promise<Product> {
    const repo = getRepository(Product);
    const product = repo.create({
      name: data.name,
      description: data.description,
      price: data.price,
    });
    return await repo.save(product);
  },

  /**
   * Update an existing product.
   * @param productId Product ID
   * @param data Product data
   * @returns Updated product
   */
  async updateProduct(
    productId: string,
    data: {
      name: string;
      description: string;
      price: number;
    }
  ): Promise<Product> {
    const repo = getRepository(Product);
    const product = await repo.findOne(productId);
    if (!product) {
      throw new Error('Product not found.');
    }
    product.name = data.name;
    product.description = data.description;
    product.price = data.price;
    return await repo.save(product);
  },

  /**
   * Delete a product.
   * @param productId Product ID
   */
  async deleteProduct(productId: string): Promise<void> {
    const repo = getRepository(Product);
    const product = await repo.findOne(productId);
    if (!product) {
      throw new Error('Product not found.');
    }
    await repo.remove(product);
  },
};

export default productsController;