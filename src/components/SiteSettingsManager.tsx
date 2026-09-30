import React, { useState } from 'react';
import { Save, Upload, X } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useImageUpload } from '../hooks/useImageUpload';

const SiteSettingsManager: React.FC = () => {
  const { siteSettings, loading, updateSiteSettings } = useSiteSettings();
  const { uploadImage, uploading } = useImageUpload();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    site_name: '',
    site_description: '',
    currency: '',
    currency_code: '',
    free_delivery_threshold: 350
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string>('');

  React.useEffect(() => {
    if (siteSettings) {
      setFormData({
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        currency: siteSettings.currency,
        currency_code: siteSettings.currency_code,
        free_delivery_threshold: siteSettings.free_delivery_threshold
      });
      setLogoPreview(siteSettings.site_logo);
      setHeroImagePreview(siteSettings.hero_image);
    }
  }, [siteSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeroImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setHeroImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      let logoUrl = logoPreview;
      let heroImageUrl = heroImagePreview;
      
      // Upload new logo if selected
      if (logoFile) {
        const uploadedUrl = await uploadImage(logoFile, 'site-logo');
        logoUrl = uploadedUrl;
      }

      // Upload new hero image if selected
      if (heroImageFile) {
        const uploadedUrl = await uploadImage(heroImageFile, 'hero-image');
        heroImageUrl = uploadedUrl;
      }

      // Update all settings
      await updateSiteSettings({
        site_name: formData.site_name,
        site_description: formData.site_description,
        currency: formData.currency,
        currency_code: formData.currency_code,
        site_logo: logoUrl,
        hero_image: heroImageUrl,
        free_delivery_threshold: formData.free_delivery_threshold
      });

      setIsEditing(false);
      setLogoFile(null);
      setHeroImageFile(null);
    } catch (error) {
      console.error('Error saving site settings:', error);
    }
  };

  const handleCancel = () => {
    if (siteSettings) {
      setFormData({
        site_name: siteSettings.site_name,
        site_description: siteSettings.site_description,
        currency: siteSettings.currency,
        currency_code: siteSettings.currency_code,
        free_delivery_threshold: siteSettings.free_delivery_threshold
      });
      setLogoPreview(siteSettings.site_logo);
      setHeroImagePreview(siteSettings.hero_image);
    }
    setIsEditing(false);
    setLogoFile(null);
    setHeroImageFile(null);
  };

  if (loading) {
    return (
      <div className="bg-broger-coal border border-broger-line rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-broger-line rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-broger-line rounded w-3/4"></div>
            <div className="h-4 bg-broger-line rounded w-1/2"></div>
            <div className="h-4 bg-broger-line rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-broger-coal border border-broger-line rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-extrabold tracking-wide text-broger-cream">Site Settings</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-broger-orange text-broger-ink font-semibold px-4 py-2 rounded-lg hover:bg-broger-glow transition-colors duration-200 flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Edit Settings</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="bg-broger-line text-broger-cream px-4 py-2 rounded-lg hover:bg-stone-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={uploading}
              className="bg-broger-orange text-broger-ink font-semibold px-4 py-2 rounded-lg hover:bg-broger-glow transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{uploading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Site Logo */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Site Logo
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-broger-ash flex items-center justify-center">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Site Logo"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-2xl text-stone-500">☕</div>
              )}
            </div>
            {isEditing && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="bg-broger-ash text-stone-300 px-4 py-2 rounded-lg hover:bg-broger-line transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Logo</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Hero Image */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Hero Image
          </label>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-20 rounded-lg overflow-hidden bg-broger-ash flex items-center justify-center">
              {heroImagePreview ? (
                <img
                  src={heroImagePreview}
                  alt="Hero Image"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-2xl text-stone-500">🍔</div>
              )}
            </div>
            {isEditing && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroImageChange}
                  className="hidden"
                  id="hero-upload"
                />
                <label
                  htmlFor="hero-upload"
                  className="bg-broger-ash text-stone-300 px-4 py-2 rounded-lg hover:bg-broger-line transition-colors duration-200 flex items-center space-x-2 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Hero Image</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Site Name
          </label>
          {isEditing ? (
            <input
              type="text"
              name="site_name"
              value={formData.site_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-broger-line rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter site name"
            />
          ) : (
            <p className="text-lg font-medium text-broger-cream">{siteSettings?.site_name}</p>
          )}
        </div>

        {/* Site Description */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Site Description
          </label>
          {isEditing ? (
            <textarea
              name="site_description"
              value={formData.site_description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-broger-line rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Enter site description"
            />
          ) : (
            <p className="text-stone-400">{siteSettings?.site_description}</p>
          )}
        </div>

        {/* Currency Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Currency Symbol
            </label>
            {isEditing ? (
              <input
                type="text"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-broger-line rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., ₱, $, €"
              />
            ) : (
              <p className="text-lg font-medium text-broger-cream">{siteSettings?.currency}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Currency Code
            </label>
            {isEditing ? (
              <input
                type="text"
                name="currency_code"
                value={formData.currency_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-broger-line rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., PHP, USD, EUR"
              />
            ) : (
              <p className="text-lg font-medium text-broger-cream">{siteSettings?.currency_code}</p>
            )}
          </div>
        </div>

        {/* Free Delivery Threshold */}
        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Free Delivery Threshold (₱)
          </label>
          {isEditing ? (
            <div>
              <input
                type="number"
                name="free_delivery_threshold"
                value={formData.free_delivery_threshold}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-broger-line rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="e.g., 350"
                min="0"
                step="10"
              />
              <p className="text-xs text-stone-400 mt-1">
                Orders reaching this amount qualify for free in-house delivery
              </p>
            </div>
          ) : (
            <p className="text-lg font-medium text-broger-cream">₱{siteSettings?.free_delivery_threshold}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SiteSettingsManager;
