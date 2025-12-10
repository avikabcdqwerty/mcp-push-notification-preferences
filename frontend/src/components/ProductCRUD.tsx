import React, { useEffect, useState } from 'react';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/api';
import type { AuthUser } from '../App';

// Product type definition
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

// Props for ProductCRUD component
interface ProductCRUDProps {
  user: AuthUser;
}

/**
 * ProductCRUD component
 * Provides UI for CRUD operations on products.
 */
const ProductCRUD: React.FC<ProductCRUDProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state for create/update
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formProduct, setFormProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
  });
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch products from backend
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load products.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormProduct((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  // Open form for creating a new product
  const openCreateForm = () => {
    setFormMode('create');
    setFormProduct({ name: '', description: '', price: 0 });
    setFormVisible(true);
    setSuccess(null);
    setError(null);
  };

  // Open form for editing an existing product
  const openEditForm = (product: Product) => {
    setFormMode('edit');
    setFormProduct(product);
    setFormVisible(true);
    setSuccess(null);
    setError(null);
  };

  // Close form
  const closeForm = () => {
    setFormVisible(false);
    setFormProduct({ name: '', description: '', price: 0 });
    setFormMode('create');
    setFormSubmitting(false);
    setSuccess(null);
    setError(null);
  };

  // Handle form submit for create/update
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (formMode === 'create') {
        await createProduct(formProduct as Product);
        setSuccess('Product created successfully.');
      } else if (formMode === 'edit' && formProduct.id) {
        await updateProduct(formProduct.id, formProduct as Product);
        setSuccess('Product updated successfully.');
      }
      closeForm();
      fetchProducts();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to save product. No changes were saved.'
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle product deletion
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      await deleteProduct(id);
      setSuccess('Product deleted successfully.');
      fetchProducts();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to delete product.'
      );
    }
  };

  // Render loading spinner
  if (loading) {
    return (
      <div className="product-crud-loading">
        <span>Loading products...</span>
      </div>
    );
  }

  return (
    <section className="product-crud-section">
      <h2>Product Management</h2>
      <p>
        Create, view, update, or delete products. All changes are securely managed.
      </p>
      {error && (
        <div className="product-crud-error" role="alert">
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="product-crud-success" role="status">
          <span>{success}</span>
        </div>
      )}
      <div className="product-crud-actions">
        <button
          className="product-crud-create-btn"
          onClick={openCreateForm}
          disabled={formVisible}
        >
          + Add Product
        </button>
      </div>
      <table className="product-crud-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price ($)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={4}>No products found.</td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.price.toFixed(2)}</td>
                <td>
                  <button
                    className="product-crud-edit-btn"
                    onClick={() => openEditForm(product)}
                    disabled={formVisible}
                  >
                    Edit
                  </button>
                  <button
                    className="product-crud-delete-btn"
                    onClick={() => handleDelete(product.id)}
                    disabled={formVisible}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Product Form Modal */}
      {formVisible && (
        <div className="product-crud-modal">
          <div className="product-crud-modal-content">
            <h3>{formMode === 'create' ? 'Add Product' : 'Edit Product'}</h3>
            <form onSubmit={handleFormSubmit} autoComplete="off">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formProduct.name || ''}
                  onChange={handleInputChange}
                  required
                  disabled={formSubmitting}
                  maxLength={100}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formProduct.description || ''}
                  onChange={handleInputChange}
                  required
                  disabled={formSubmitting}
                  maxLength={500}
                />
              </div>
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formProduct.price !== undefined ? formProduct.price : ''}
                  onChange={handleInputChange}
                  required
                  disabled={formSubmitting}
                />
              </div>
              <div className="product-crud-modal-actions">
                <button
                  type="submit"
                  className="product-crud-save-btn"
                  disabled={formSubmitting}
                >
                  {formSubmitting
                    ? formMode === 'create'
                      ? 'Creating...'
                      : 'Updating...'
                    : formMode === 'create'
                    ? 'Create'
                    : 'Update'}
                </button>
                <button
                  type="button"
                  className="product-crud-cancel-btn"
                  onClick={closeForm}
                  disabled={formSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductCRUD;