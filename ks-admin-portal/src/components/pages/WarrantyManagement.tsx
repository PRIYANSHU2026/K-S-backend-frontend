import { useState, useEffect } from 'react';
import {
  getWarranties,
  createWarranty,
  updateWarranty,
  deleteWarranty
} from '@/services/warranty.service';
import { getProducts } from '@/services/product.service';
import { getCustomers } from '@/services/customer.service';
import type { Warranty, Product, Customer, WarrantyFormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Plus, Pencil, Trash2, ShieldCheck, Calendar, User2, Package } from 'lucide-react';

const WarrantyManagement = () => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentWarranty, setCurrentWarranty] = useState<Warranty | null>(null);
  const [formData, setFormData] = useState<WarrantyFormData>({
    product_id: '',
    customer_id: '',
    purchase_date: '',
    expiry_date: '',
    warranty_details: '',
    status: 'active',
  });

  // Load warranties, products, and customers on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [warrantiesData, productsData, customersData] = await Promise.all([
          getWarranties(),
          getProducts(),
          getCustomers()
        ]);
        setWarranties(warrantiesData);
        setProducts(productsData);
        setCustomers(customersData);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load warranties');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      customer_id: '',
      purchase_date: '',
      expiry_date: '',
      warranty_details: '',
      status: 'active',
    });
    setIsEditing(false);
    setCurrentWarranty(null);
  };

  const handleAddWarranty = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditWarranty = (warranty: Warranty) => {
    setCurrentWarranty(warranty);

    const purchaseDate = warranty.purchase_date ?
      new Date(warranty.purchase_date).toISOString().split('T')[0] : '';

    const expiryDate = warranty.expiry_date ?
      new Date(warranty.expiry_date).toISOString().split('T')[0] : '';

    setFormData({
      product_id: warranty.product_id,
      customer_id: warranty.customer_id,
      purchase_date: purchaseDate,
      expiry_date: expiryDate,
      warranty_details: warranty.warranty_details || '',
      status: warranty.status,
    });

    setIsEditing(true);
    setShowForm(true);
  };

  const handleDeleteClick = (warranty: Warranty) => {
    setCurrentWarranty(warranty);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentWarranty) return;

    try {
      await deleteWarranty(currentWarranty.id);

      // Update local state after successful deletion
      setWarranties(prevWarranties =>
        prevWarranties.filter(warranty => warranty.id !== currentWarranty.id)
      );

      toast.success('Warranty deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete warranty:', error);
      toast.error('Failed to delete warranty');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && currentWarranty) {
        // Update existing warranty
        const updatedWarranty = await updateWarranty(currentWarranty.id, formData);

        // Update warranties array with the updated warranty
        setWarranties(prevWarranties =>
          prevWarranties.map(warranty =>
            warranty.id === updatedWarranty.id ? updatedWarranty : warranty
          )
        );

        toast.success('Warranty updated successfully');
      } else {
        // Create new warranty
        const newWarranty = await createWarranty(formData);

        // Add new warranty to the warranties array
        setWarranties(prevWarranties => [...prevWarranties, newWarranty]);

        toast.success('Warranty created successfully');
      }

      // Close form and reset state
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save warranty:', error);
      toast.error('Failed to save warranty');
    }
  };

  // Helper to find product name by ID
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  // Helper to find customer name by ID
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  // Helper to format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warranty Management</h1>
          <p className="text-muted-foreground">
            Map products to customers with warranty information
          </p>
        </div>
        <Button onClick={handleAddWarranty}>
          <Plus className="mr-2 h-4 w-4" />
          Add Warranty
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warranties</CardTitle>
          <CardDescription>
            A list of all product warranties and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <p>Loading warranties...</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Purchase Date</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warranties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No warranties found. Click "Add Warranty" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    warranties.map((warranty) => (
                      <TableRow key={warranty.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{warranty.product_name || getProductName(warranty.product_id)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User2 className="h-4 w-4 text-muted-foreground" />
                            {warranty.customer_name || getCustomerName(warranty.customer_id)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(warranty.purchase_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(warranty.expiry_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            warranty.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : warranty.status === 'expired'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEditWarranty(warranty)}
                              title="Edit warranty"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDeleteClick(warranty)}
                              title="Delete warranty"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Warranty Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {isEditing ? 'Edit Warranty' : 'Register New Warranty'}
              </div>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="product_id" className="text-right">
                  Product
                </label>
                <select
                  id="product_id"
                  name="product_id"
                  className="col-span-3 rounded-md border border-input bg-background px-3 py-2"
                  value={formData.product_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="customer_id" className="text-right">
                  Customer
                </label>
                <select
                  id="customer_id"
                  name="customer_id"
                  className="col-span-3 rounded-md border border-input bg-background px-3 py-2"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="purchase_date" className="text-right">
                  Purchase Date
                </label>
                <Input
                  id="purchase_date"
                  name="purchase_date"
                  type="date"
                  className="col-span-3"
                  value={formData.purchase_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="expiry_date" className="text-right">
                  Expiry Date
                </label>
                <Input
                  id="expiry_date"
                  name="expiry_date"
                  type="date"
                  className="col-span-3"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="status" className="text-right">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="col-span-3 rounded-md border border-input bg-background px-3 py-2"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="claimed">Claimed</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="warranty_details" className="text-right">
                  Details
                </label>
                <textarea
                  id="warranty_details"
                  name="warranty_details"
                  className="col-span-3 min-h-[80px] rounded-md border border-input bg-background px-3 py-2"
                  value={formData.warranty_details}
                  onChange={handleInputChange}
                  placeholder="Additional warranty details or notes"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">
                {isEditing ? 'Update Warranty' : 'Register Warranty'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this warranty?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the warranty record
              for product "{currentWarranty?.product_name || getProductName(currentWarranty?.product_id || '')}"
              registered to "{currentWarranty?.customer_name || getCustomerName(currentWarranty?.customer_id || '')}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WarrantyManagement;
