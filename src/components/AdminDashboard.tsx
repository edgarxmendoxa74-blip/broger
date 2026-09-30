import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, ArrowLeft, Coffee, TrendingUp, Package, Users, FolderOpen, CreditCard, Settings, Sidebar, MessageSquare, Truck } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';
import { addOnCategories } from '../data/menuData';
import { useMenu } from '../hooks/useMenu';
import { useCategories } from '../hooks/useCategories';
import ImageUpload from './ImageUpload';
import CategoryManager from './CategoryManager';
import PaymentMethodManager from './PaymentMethodManager';
import SiteSettingsManager from './SiteSettingsManager';
import SidebarContentManager from './SidebarContentManager';
import ReviewManager from './ReviewManager';
import ServiceOptionManager from './ServiceOptionManager';

const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('beracah_admin_auth') === 'true';
  });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { menuItems, loading, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const { categories } = useCategories();
  const [currentView, setCurrentView] = useState<'dashboard' | 'items' | 'add' | 'edit' | 'categories' | 'payments' | 'settings' | 'sidebar' | 'reviews' | 'service-options'>('dashboard');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    basePrice: 0,
    category: 'hot-coffee',
    popular: false,
    available: true,
    sort_order: 0,
    variations: [],
    addOns: []
  });

  const handleAddItem = () => {
    setCurrentView('add');
    const defaultCategory = categories.length > 0 ? categories[0].id : 'dim-sum';
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      category: defaultCategory,
      popular: false,
      available: true,
      sort_order: 0,
      variations: [],
      addOns: []
    });
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setCurrentView('edit');
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      try {
        setIsProcessing(true);
        await deleteMenuItem(id);
      } catch (error) {
        alert('Failed to delete item. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSaveItem = async () => {
    if (!formData.name || !formData.description || !formData.basePrice) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editingItem) {
        await updateMenuItem(editingItem.id, formData);
      } else {
        await addMenuItem(formData as Omit<MenuItem, 'id'>);
      }
      setCurrentView('items');
      setEditingItem(null);
    } catch (error) {
      alert('Failed to save item');
    }
  };

  const handleCancel = () => {
    setCurrentView(currentView === 'add' || currentView === 'edit' ? 'items' : 'dashboard');
    setEditingItem(null);
    setSelectedItems([]);
  };

  const handleBulkRemove = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to delete');
      return;
    }

    const itemNames = selectedItems.map(id => {
      const item = menuItems.find(i => i.id === id);
      return item ? item.name : 'Unknown Item';
    }).slice(0, 5); // Show first 5 items
    
    const displayNames = itemNames.join(', ');
    const moreItems = selectedItems.length > 5 ? ` and ${selectedItems.length - 5} more items` : '';
    
    if (confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?\n\nItems to delete: ${displayNames}${moreItems}\n\nThis action cannot be undone.`)) {
      try {
        setIsProcessing(true);
        // Delete items one by one
        for (const itemId of selectedItems) {
          await deleteMenuItem(itemId);
        }
        setSelectedItems([]);
        setShowBulkActions(false);
        alert(`Successfully deleted ${selectedItems.length} item(s).`);
      } catch (error) {
        alert('Failed to delete some items. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };
  const handleBulkCategoryChange = async (newCategoryId: string) => {
    if (selectedItems.length === 0) {
      alert('Please select items to update');
      return;
    }

    const categoryName = categories.find(cat => cat.id === newCategoryId)?.name;
    if (confirm(`Are you sure you want to change the category of ${selectedItems.length} item(s) to "${categoryName}"?`)) {
      try {
        setIsProcessing(true);
        // Update category for each selected item
        for (const itemId of selectedItems) {
          const item = menuItems.find(i => i.id === itemId);
          if (item) {
            await updateMenuItem(itemId, { ...item, category: newCategoryId });
          }
        }
        setSelectedItems([]);
        setShowBulkActions(false);
        alert(`Successfully updated category for ${selectedItems.length} item(s)`);
      } catch (error) {
        alert('Failed to update some items');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === menuItems.length) {
      setSelectedItems([]);
      setShowBulkActions(false);
    } else {
      setSelectedItems(menuItems.map(item => item.id));
      setShowBulkActions(true);
    }
  };

  // Update bulk actions visibility when selection changes
  React.useEffect(() => {
    setShowBulkActions(selectedItems.length > 0);
  }, [selectedItems]);

  const addVariation = () => {
    const newVariation: Variation = {
      id: `var-${Date.now()}`,
      name: '',
      price: 0
    };
    setFormData({
      ...formData,
      variations: [...(formData.variations || []), newVariation]
    });
  };

  const updateVariation = (index: number, field: keyof Variation, value: string | number) => {
    const updatedVariations = [...(formData.variations || [])];
    updatedVariations[index] = { ...updatedVariations[index], [field]: value };
    setFormData({ ...formData, variations: updatedVariations });
  };

  const removeVariation = (index: number) => {
    const updatedVariations = formData.variations?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, variations: updatedVariations });
  };

  const addAddOn = () => {
    const newAddOn: AddOn = {
      id: `addon-${Date.now()}`,
      name: '',
      price: 0,
      category: 'extras'
    };
    setFormData({
      ...formData,
      addOns: [...(formData.addOns || []), newAddOn]
    });
  };

  const updateAddOn = (index: number, field: keyof AddOn, value: string | number) => {
    const updatedAddOns = [...(formData.addOns || [])];
    updatedAddOns[index] = { ...updatedAddOns[index], [field]: value };
    setFormData({ ...formData, addOns: updatedAddOns });
  };

  const removeAddOn = (index: number) => {
    const updatedAddOns = formData.addOns?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, addOns: updatedAddOns });
  };

  // Dashboard Stats
  const totalItems = menuItems.length;
  const popularItems = menuItems.filter(item => item.popular).length;
  const availableItems = menuItems.filter(item => item.available).length;
  const categoryCounts = categories.map(cat => ({
    ...cat,
    count: menuItems.filter(item => item.category === cat.id).length
  }));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@broger.com' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('beracah_admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('beracah_admin_auth');
    setEmail('');
    setPassword('');
    setCurrentView('dashboard');
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen broger-chalkboard text-broger-cream flex items-center justify-center">
        <div className="bg-broger-coal border border-broger-orange/30 rounded-2xl shadow-neon p-8 w-full max-w-md mx-4">
          <div className="text-center mb-8">
            <img src="/logo.jpg" alt="Bro-Ger logo" className="mx-auto w-24 h-24 rounded-full neon-ring mb-5" />
            <h1 className="text-2xl font-display font-extrabold tracking-wide text-broger-cream">Admin Access</h1>
            <p className="text-stone-400 mt-2">Enter your credentials to access the admin dashboard</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-broger-cream mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                placeholder="Enter admin email"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-broger-cream mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
              {loginError && (
                <p className="text-red-500 text-sm mt-2">{loginError}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-broger-orange text-broger-ink font-semibold py-3 rounded-lg hover:bg-broger-glow transition-colors duration-200 font-medium"
            >
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen broger-chalkboard text-broger-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-broger-orange mx-auto mb-4"></div>
          <p className="text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Form View (Add/Edit)
  if (currentView === 'add' || currentView === 'edit') {
    return (
      <div className="min-h-screen broger-chalkboard text-broger-cream">
        <div className="bg-broger-ink/95 backdrop-blur-md border-b border-broger-orange/30 shadow-[0_1px_12px_rgba(255,138,31,0.15)] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 text-stone-400 hover:text-broger-orange transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
                <h1 className="text-2xl font-display font-extrabold tracking-wide text-broger-cream">
                  {currentView === 'add' ? 'Add New Item' : 'Edit Item'}
                </h1>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-broger-line rounded-lg hover:bg-broger-ash transition-colors duration-200 flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSaveItem}
                  className="px-4 py-2 bg-broger-orange text-broger-ink font-semibold rounded-lg hover:bg-broger-glow transition-colors duration-200 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-broger-coal border border-broger-line rounded-xl shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-broger-cream mb-2">Item Name *</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-broger-cream mb-2">Base Price *</label>
                <input
                  type="number"
                  value={formData.basePrice || ''}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-broger-cream mb-2">Category *</label>
                <select
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.popular || false}
                    onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                    className="rounded border-broger-line text-broger-orange focus:ring-broger-orange"
                  />
                  <span className="text-sm font-medium text-broger-cream">Mark as Popular</span>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.available ?? true}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="rounded border-broger-line text-broger-orange focus:ring-broger-orange"
                  />
                  <span className="text-sm font-medium text-broger-cream">Available for Order</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-broger-cream mb-2">Sort Order *</label>
                <input
                  type="number"
                  value={formData.sort_order ?? 0}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                  placeholder="0"
                />
                <p className="text-xs text-stone-400 mt-1">
                  Lower numbers appear first. Items with the same value are ordered by creation date.
                </p>
              </div>
            </div>

            {/* Discount Pricing Section */}
            <div className="mb-8">
              <h3 className="text-lg font-display font-extrabold tracking-wide text-broger-cream mb-4">Discount Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-broger-cream mb-2">Discount Price</label>
                  <input
                    type="number"
                    value={formData.discountPrice || ''}
                    onChange={(e) => setFormData({ ...formData, discountPrice: Number(e.target.value) || undefined })}
                    className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                    placeholder="Enter discount price"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.discountActive || false}
                      onChange={(e) => setFormData({ ...formData, discountActive: e.target.checked })}
                      className="rounded border-broger-line text-broger-orange focus:ring-broger-orange"
                    />
                    <span className="text-sm font-medium text-broger-cream">Enable Discount</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-broger-cream mb-2">Discount Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.discountStartDate || ''}
                    onChange={(e) => setFormData({ ...formData, discountStartDate: e.target.value || undefined })}
                    className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-broger-cream mb-2">Discount End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.discountEndDate || ''}
                    onChange={(e) => setFormData({ ...formData, discountEndDate: e.target.value || undefined })}
                    className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                  />
                </div>
              </div>
              <p className="text-sm text-stone-400 mt-2">
                Leave dates empty for indefinite discount period. Discount will only be active if "Enable Discount" is checked and current time is within the date range.
              </p>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-broger-cream mb-2">Description *</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                placeholder="Enter item description"
                rows={3}
              />
            </div>

            <div className="mb-8">
              <ImageUpload
                currentImage={formData.image}
                onImageChange={(imageUrl) => setFormData({ ...formData, image: imageUrl })}
              />
            </div>

            {/* Variations Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-extrabold tracking-wide text-broger-cream">Size Variations</h3>
                <button
                  onClick={addVariation}
                  className="flex items-center space-x-2 px-3 py-2 bg-cream-100 text-broger-cream rounded-lg hover:bg-cream-200 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Variation</span>
                </button>
              </div>

              {formData.variations?.map((variation, index) => (
                <div key={variation.id} className="flex items-center space-x-3 mb-3 p-4 bg-broger-ash rounded-lg">
                  <input
                    type="text"
                    value={variation.name}
                    onChange={(e) => updateVariation(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-broger-line rounded focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                    placeholder="Variation name (e.g., Small, Medium, Large)"
                  />
                  <input
                    type="number"
                    value={variation.price}
                    onChange={(e) => updateVariation(index, 'price', Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-broger-line rounded focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                    placeholder="Price"
                  />
                  <button
                    onClick={() => removeVariation(index)}
                    className="p-2 text-red-500 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add-ons Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-extrabold tracking-wide text-broger-cream">Add-ons</h3>
                <button
                  onClick={addAddOn}
                  className="flex items-center space-x-2 px-3 py-2 bg-cream-100 text-broger-cream rounded-lg hover:bg-cream-200 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Add-on</span>
                </button>
              </div>

              {formData.addOns?.map((addOn, index) => (
                <div key={addOn.id} className="flex items-center space-x-3 mb-3 p-4 bg-broger-ash rounded-lg">
                  <input
                    type="text"
                    value={addOn.name}
                    onChange={(e) => updateAddOn(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 border border-broger-line rounded focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                    placeholder="Add-on name"
                  />
                  <select
                    value={addOn.category}
                    onChange={(e) => updateAddOn(index, 'category', e.target.value)}
                    className="px-3 py-2 border border-broger-line rounded focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                  >
                    {addOnCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={addOn.price}
                    onChange={(e) => updateAddOn(index, 'price', Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-broger-line rounded focus:ring-2 focus:ring-broger-orange focus:border-transparent"
                    placeholder="Price"
                  />
                  <button
                    onClick={() => removeAddOn(index)}
                    className="p-2 text-red-500 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Items List View
  if (currentView === 'items') {
    return (
      <div className="min-h-screen broger-chalkboard text-broger-cream">
        <div className="bg-broger-ink/95 backdrop-blur-md border-b border-broger-orange/30 shadow-[0_1px_12px_rgba(255,138,31,0.15)] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center space-x-2 text-stone-400 hover:text-broger-orange transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
                <h1 className="text-2xl font-display font-extrabold tracking-wide text-broger-cream">Menu Items</h1>
              </div>
              <div className="flex items-center space-x-3">
                {showBulkActions && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-stone-400">
                      {selectedItems.length} item(s) selected
                    </span>
                    <button
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className="flex items-center space-x-2 bg-broger-orange text-broger-ink font-semibold px-4 py-2 rounded-lg hover:bg-broger-glow transition-colors duration-200"
                    >
                      <span>Bulk Actions</span>
                    </button>
                  </div>
                )}
                <button
                  onClick={handleAddItem}
                  className="flex items-center space-x-2 bg-broger-orange text-broger-ink font-semibold px-4 py-2 rounded-lg hover:bg-broger-glow transition-colors duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Bulk Actions Panel */}
          {showBulkActions && selectedItems.length > 0 && (
            <div className="bg-broger-coal border border-broger-line rounded-xl shadow-sm p-6 mb-6 border-l-4 border-broger-orange">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-broger-cream mb-1">Bulk Actions</h3>
                  <p className="text-sm text-stone-400">{selectedItems.length} item(s) selected</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Change Category */}
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-stone-300">Change Category:</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkCategoryChange(e.target.value);
                          e.target.value = ''; // Reset selection
                        }
                      }}
                      className="px-3 py-2 border border-broger-line rounded-lg focus:ring-2 focus:ring-broger-orange focus:border-transparent text-sm"
                      disabled={isProcessing}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Remove Items */}
                  <button
                    onClick={handleBulkRemove}
                    disabled={isProcessing}
                    className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>{isProcessing ? 'Removing...' : 'Remove Selected'}</span>
                  </button>
                  
                  {/* Clear Selection */}
                  <button
                    onClick={() => {
                      setSelectedItems([]);
                      setShowBulkActions(false);
                    }}
                    className="flex items-center space-x-2 bg-broger-line text-broger-cream px-4 py-2 rounded-lg hover:bg-stone-600 transition-colors duration-200 text-sm"
                  >
                    <X className="h-4 w-4" />
                    <span>Clear Selection</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-broger-coal border border-broger-line rounded-xl shadow-sm overflow-hidden">
            {/* Bulk Actions Bar */}
            {menuItems.length > 0 && (
              <div className="bg-broger-ash border-b border-broger-line px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === menuItems.length && menuItems.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-broger-line text-broger-orange focus:ring-broger-orange"
                      />
                      <span className="text-sm font-medium text-stone-300">
                        Select All ({menuItems.length} items)
                      </span>
                    </label>
                  </div>
                  {selectedItems.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-stone-400">
                        {selectedItems.length} item(s) selected
                      </span>
                      <button
                        onClick={() => setSelectedItems([])}
                        className="text-sm text-stone-400 hover:text-broger-orange transition-colors duration-200"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-broger-ash">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-broger-cream">
                      Select
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-broger-cream">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-broger-cream">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-broger-cream">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-broger-cream">Sort Order</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-broger-cream">Variations</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-broger-cream">Add-ons</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-broger-cream">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-broger-cream">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-broger-line">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-broger-ash">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          className="rounded border-broger-line text-sky-400 focus:ring-broger-orange"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-broger-cream">{item.name}</div>
                          <div className="text-sm text-stone-400 truncate max-w-xs">{item.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-400">
                        {categories.find(cat => cat.id === item.category)?.name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-broger-cream">
                        <div className="flex flex-col">
                          {item.isOnDiscount && item.discountPrice ? (
                            <>
                              <span className="text-red-400 font-semibold">₱{item.discountPrice}</span>
                              <span className="text-stone-400 line-through text-xs">₱{item.basePrice}</span>
                            </>
                          ) : (
                            <span>₱{item.basePrice}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-400">
                        <span className="inline-flex items-center px-2 py-1 bg-broger-ash text-stone-300 rounded-md font-medium">
                          {item.sort_order ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-400">
                        {item.variations?.length || 0} variations
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-400">
                        {item.addOns?.length || 0} add-ons
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          {item.popular && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-broger-orange text-broger-ink">
                              Popular
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.available 
                              ? 'bg-green-500/15 text-green-300' 
                              : 'bg-red-500/15 text-red-300'
                          }`}>
                            {item.available ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditItem(item)}
                            disabled={isProcessing}
                            className="p-2 text-stone-500 hover:text-broger-orange hover:bg-broger-ash rounded transition-colors duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={isProcessing}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {menuItems.map((item) => (
                <div key={item.id} className={`p-4 border-b border-broger-line last:border-b-0 ${selectedItems.includes(item.id) ? 'bg-sky-500/10' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-broger-line text-broger-orange focus:ring-broger-orange"
                      />
                      <span className="text-sm text-stone-400">Select</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        disabled={isProcessing}
                        className="p-2 text-stone-500 hover:text-broger-orange hover:bg-broger-ash rounded transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={isProcessing}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-broger-cream truncate">{item.name}</h3>
                      <p className="text-sm text-stone-400 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-stone-400">Category:</span>
                      <span className="ml-1 text-broger-cream">
                        {categories.find(cat => cat.id === item.category)?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400">Price:</span>
                      <span className="ml-1 font-medium text-broger-cream">
                        {item.isOnDiscount && item.discountPrice ? (
                          <span className="text-red-400">₱{item.discountPrice}</span>
                        ) : (
                          `₱${item.basePrice}`
                        )}
                        {item.isOnDiscount && item.discountPrice && (
                          <span className="text-stone-400 line-through text-xs ml-1">₱{item.basePrice}</span>
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400">Variations:</span>
                      <span className="ml-1 text-broger-cream">{item.variations?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-stone-400">Add-ons:</span>
                      <span className="ml-1 text-broger-cream">{item.addOns?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      {item.popular && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-broger-orange text-broger-ink">
                          Popular
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.available 
                          ? 'bg-green-500/15 text-green-300' 
                          : 'bg-red-500/15 text-red-300'
                      }`}>
                        {item.available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Categories View
  if (currentView === 'categories') {
    return <CategoryManager onBack={() => setCurrentView('dashboard')} />;
  }

  // Payment Methods View
  if (currentView === 'payments') {
    return <PaymentMethodManager onBack={() => setCurrentView('dashboard')} />;
  }

  // Site Settings View
  if (currentView === 'settings') {
    return (
      <div className="min-h-screen broger-chalkboard text-broger-cream">
        <div className="bg-broger-ink/95 backdrop-blur-md border-b border-broger-orange/30 shadow-[0_1px_12px_rgba(255,138,31,0.15)] sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="flex items-center space-x-2 text-stone-400 hover:text-broger-orange transition-colors duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Dashboard</span>
                </button>
                <h1 className="text-2xl font-display font-extrabold tracking-wide text-broger-cream">Site Settings</h1>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <SiteSettingsManager />
        </div>
      </div>
    );
  }

  // Sidebar Content View
  if (currentView === 'sidebar') {
    return <SidebarContentManager onBack={() => setCurrentView('dashboard')} />;
  }

  // Reviews View
  if (currentView === 'reviews') {
    return <ReviewManager onBack={() => setCurrentView('dashboard')} />;
  }

  // Service Options View
  if (currentView === 'service-options') {
    return <ServiceOptionManager onBack={() => setCurrentView('dashboard')} />;
  }

  // Dashboard View
  return (
    <div className="min-h-screen broger-chalkboard text-broger-cream">
      <div className="bg-broger-ink/95 backdrop-blur-md border-b border-broger-orange/30 shadow-[0_1px_12px_rgba(255,138,31,0.15)] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src="/logo.jpg" alt="Bro-Ger logo" className="h-10 w-10 rounded-full neon-ring" />
              <h1 className="text-2xl font-display font-extrabold tracking-wide text-broger-cream">Bro-Ger Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-stone-400 hover:text-broger-orange transition-colors duration-200"
              >
                View Website
              </a>
              <button
                onClick={handleLogout}
                className="text-stone-400 hover:text-broger-orange transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-broger-coal border border-broger-line rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-broger-orange/15 border border-broger-orange/40 rounded-lg">
                <Package className="h-6 w-6 text-broger-orange" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-400">Total Items</p>
                <p className="text-2xl font-semibold text-broger-cream">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-broger-coal border border-broger-line rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-broger-orange/15 border border-broger-orange/40 rounded-lg">
                <TrendingUp className="h-6 w-6 text-broger-orange" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-400">Available Items</p>
                <p className="text-2xl font-semibold text-broger-cream">{availableItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-broger-coal border border-broger-line rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-broger-orange/15 border border-broger-orange/40 rounded-lg">
                <Coffee className="h-6 w-6 text-broger-orange" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-400">Popular Items</p>
                <p className="text-2xl font-semibold text-broger-cream">{popularItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-broger-coal border border-broger-line rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-broger-orange/15 border border-broger-orange/40 rounded-lg">
                <Users className="h-6 w-6 text-broger-orange" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-stone-400">Active</p>
                <p className="text-2xl font-semibold text-broger-cream">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-broger-coal border border-broger-line rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-display font-extrabold tracking-wide text-broger-cream mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={handleAddItem}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-broger-ash rounded-lg transition-colors duration-200"
              >
                <Plus className="h-5 w-5 text-stone-500" />
                <span className="font-medium text-broger-cream">Add New Menu Item</span>
              </button>
              <button
                onClick={() => setCurrentView('items')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-broger-ash rounded-lg transition-colors duration-200"
              >
                <Package className="h-5 w-5 text-stone-500" />
                <span className="font-medium text-broger-cream">Manage Menu Items</span>
              </button>
              <button
                onClick={() => setCurrentView('categories')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-broger-ash rounded-lg transition-colors duration-200"
              >
                <FolderOpen className="h-5 w-5 text-stone-500" />
                <span className="font-medium text-broger-cream">Manage Categories</span>
              </button>
              <button
                onClick={() => setCurrentView('payments')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-broger-ash rounded-lg transition-colors duration-200"
              >
                <CreditCard className="h-5 w-5 text-stone-500" />
                <span className="font-medium text-broger-cream">Payment Methods</span>
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-broger-ash rounded-lg transition-colors duration-200"
              >
                <Settings className="h-5 w-5 text-stone-500" />
                <span className="font-medium text-broger-cream">Site Settings</span>
              </button>
              <button
                onClick={() => setCurrentView('sidebar')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-broger-ash rounded-lg transition-colors duration-200"
              >
                <Sidebar className="h-5 w-5 text-stone-500" />
                <span className="font-medium text-broger-cream">Sidebar Content</span>
              </button>
              <button
                onClick={() => setCurrentView('reviews')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-broger-ash rounded-lg transition-colors duration-200"
              >
                <MessageSquare className="h-5 w-5 text-stone-500" />
                <span className="font-medium text-broger-cream">Customer Reviews</span>
              </button>
              <button
                onClick={() => setCurrentView('service-options')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-broger-ash rounded-lg transition-colors duration-200"
              >
                <Truck className="h-5 w-5 text-stone-500" />
                <span className="font-medium text-broger-cream">Service Options</span>
              </button>
            </div>
          </div>

          <div className="bg-broger-coal border border-broger-line rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-display font-extrabold tracking-wide text-broger-cream mb-4">Categories Overview</h3>
            <div className="space-y-3">
              {categoryCounts.map((category) => (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium text-broger-cream">{category.name}</span>
                  </div>
                  <span className="text-sm text-stone-400">{category.count} items</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;