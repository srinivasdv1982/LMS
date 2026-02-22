import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { Edit } from 'lucide-react';
import toast from 'react-hot-toast';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        inventoryItemId: '',
        transactionType: 'PURCHASE',
        quantity: '',
        unitPrice: '',
        vendorId: ''
    });

    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [itemFormData, setItemFormData] = useState({
        itemCode: '',
        itemName: '',
        category: '',
        unitOfMeasure: '',
        reorderLevel: '',
        initialStock: ''
    });

    const fetchInventory = async () => {
        try {
            const response = await api.get('/inventory');
            setInventory(response.data);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await api.get('/inventory/vendors');
            setVendors(response.data);
        } catch (err) {
            console.error('Error fetching vendors:', err);
        }
    };

    useEffect(() => {
        fetchInventory();
        fetchVendors();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleItemInputChange = (e) => {
        const { name, value } = e.target;
        setItemFormData({ ...itemFormData, [name]: value });
    };

    const handleEditItemClick = (item) => {
        setItemFormData({
            itemCode: item.ItemCode,
            itemName: item.ItemName,
            category: item.Category || '',
            unitOfMeasure: item.UnitOfMeasure || '',
            reorderLevel: item.ReorderLevel || '',
            initialStock: item.CurrentStock || 0
        });
        setEditingItemId(item.InventoryItemId);
        setIsItemModalOpen(true);
    };

    const handleOpenAddItemModal = () => {
        setItemFormData({ itemCode: '', itemName: '', category: '', unitOfMeasure: '', reorderLevel: '', initialStock: '' });
        setEditingItemId(null);
        setIsItemModalOpen(true);
    };

    const handleItemSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItemId) {
                await api.put(`/inventory/${editingItemId}`, itemFormData);
                toast.success('Inventory item updated successfully!');
            } else {
                await api.post('/inventory', itemFormData);
                toast.success('Inventory item created successfully!');
            }
            setIsItemModalOpen(false);
            fetchInventory();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to save inventory item.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/inventory/transaction', {
                ...formData,
                quantity: Number(formData.quantity),
                unitPrice: formData.unitPrice ? Number(formData.unitPrice) : 0,
                vendorId: formData.vendorId ? Number(formData.vendorId) : null
            });
            toast.success('Transaction recorded successfully!');
            setIsModalOpen(false);
            setFormData({
                inventoryItemId: '', transactionType: 'PURCHASE', quantity: '', unitPrice: '', vendorId: ''
            });
            fetchInventory(); // Refresh the grid
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to record transaction. Please check inputs.');
        }
    };


    const columns = [
        { key: 'ItemCode', label: 'Item Code' },
        { key: 'ItemName', label: 'Item Name' },
        { key: 'Category', label: 'Category' },
        { key: 'CurrentStock', label: 'Stock' },
        { key: 'UnitOfMeasure', label: 'UOM' },
        { key: 'ReorderLevel', label: 'Reorder Level' },
        {
            key: 'Status',
            label: 'Status',
            render: (_, row) => (
                <span className={`px-2 py-1 rounded text-xs ${row.CurrentStock <= row.ReorderLevel ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                    {row.CurrentStock <= row.ReorderLevel ? 'Reorder' : 'In Stock'}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            searchable: false,
            render: (_, row) => (
                <button
                    onClick={() => handleEditItemClick(row)}
                    title="Edit Item"
                    className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                >
                    <Edit size={18} />
                </button>
            )
        }
    ];

    return (
        <>
            <div>
                <div className="topbar">
                    <h3>Inventory Management</h3>
                    <div className="flex gap-3">
                        <button
                            onClick={handleOpenAddItemModal}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium transition-colors shadow-sm"
                        >
                            + Add Item
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium transition-colors shadow-sm"
                        >
                            + Add Transaction
                        </button>
                    </div>
                </div>

                <div className="table-container pt-0 mt-4 relative">
                    <DataTable columns={columns} data={inventory} loading={loading} />
                </div>
            </div>
            {/* Add Transaction Modal - Rendered outside the main flow to avoid z-index conflicts with DataGrid */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-[9999]"
                >
                    <div className="bg-white border border-slate-200 rounded-lg p-6 w-full max-w-md shadow-2xl relative">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">Record Stock Transaction</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Inventory Item *</label>
                                <select required name="inventoryItemId" value={formData.inventoryItemId} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow">
                                    <option value="">Select Item</option>
                                    {inventory.map(item => (
                                        <option key={item.InventoryItemId} value={item.InventoryItemId}>
                                            {item.ItemName} (Current: {item.CurrentStock} {item.UnitOfMeasure})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Type *</label>
                                    <select required name="transactionType" value={formData.transactionType} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow">
                                        <option value="PURCHASE">Stock IN (Purchase)</option>
                                        <option value="ISSUE">Stock OUT (Issue)</option>
                                        <option value="DAMAGE">Stock OUT (Damage / Scrap)</option>
                                        <option value="ADJUSTMENT">Stock IN (Adjustment)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantity *</label>
                                    <input required type="number" min="1" name="quantity" value={formData.quantity} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price (₹)</label>
                                    <input type="number" min="0" step="0.01" name="unitPrice" value={formData.unitPrice} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Vendor</label>
                                    <select name="vendorId" value={formData.vendorId} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow">
                                        <option value="">No Vendor (Internal)</option>
                                        {vendors.map(vendor => (
                                            <option key={vendor.VendorId} value={vendor.VendorId}>
                                                {vendor.VendorName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Add/Edit Inventory Item Modal */}
            {isItemModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-[9999]">
                    <div className="bg-white border border-slate-200 rounded-lg p-6 w-full max-w-md shadow-2xl relative">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">{editingItemId ? 'Edit Inventory Item' : 'Add New Item'}</h2>
                        <form onSubmit={handleItemSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Code</label>
                                    <input type="text" name="itemCode" value={itemFormData.itemCode} onChange={handleItemInputChange} placeholder="Auto if empty" className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Item Name *</label>
                                    <input required type="text" name="itemName" value={itemFormData.itemName} onChange={handleItemInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select name="category" value={itemFormData.category} onChange={handleItemInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500">
                                        <option value="">None (Uncategorized)</option>
                                        <option value="Cleaning Supplies">Cleaning Supplies</option>
                                        <option value="Toiletries & Amenities">Toiletries & Amenities</option>
                                        <option value="Linens & Towels">Linens & Towels</option>
                                        <option value="Electronics & Appliances">Electronics & Appliances</option>
                                        <option value="Furniture & Decor">Furniture & Decor</option>
                                        <option value="Maintenance & Hardware">Maintenance & Hardware</option>
                                        <option value="Food & Beverage">Food & Beverage</option>
                                        <option value="Kitchenware">Kitchenware</option>
                                        <option value="Stationery">Stationery</option>
                                        <option value="Miscellaneous">Miscellaneous</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit of Measure</label>
                                    <select name="unitOfMeasure" value={itemFormData.unitOfMeasure} onChange={handleItemInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500">
                                        <option value="">Select UOM</option>
                                        <option value="Kg">Kilogram (Kg)</option>
                                        <option value="Grams">Grams (g)</option>
                                        <option value="Liter">Liter (L)</option>
                                        <option value="mL">Milliliter (mL)</option>
                                        <option value="Piece">Piece (Pcs)</option>
                                        <option value="Box">Box</option>
                                        <option value="Packet">Packet</option>
                                        <option value="Bottle">Bottle</option>
                                        <option value="Dozen">Dozen</option>
                                        <option value="Meter">Meter (m)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
                                    <input type="number" name="reorderLevel" value={itemFormData.reorderLevel} onChange={handleItemInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500" />
                                </div>
                                {!editingItemId && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Initial Stock</label>
                                        <input type="number" name="initialStock" value={itemFormData.initialStock} onChange={handleItemInputChange} className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-slate-800 outline-none focus:border-blue-500" />
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Inventory;
