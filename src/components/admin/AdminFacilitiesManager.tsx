import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles, 
  Info, 
  RotateCcw, 
  Layers, 
  Flame,
  DollarSign,
  ShieldCheck,
  Save,
  CheckCircle2,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';
import { facilityService } from '../../services/facilityService';
import { Facility } from '../../types';

interface AdminFacilitiesManagerProps {
  showToast: (msg: string) => void;
}

const PRESET_CATHEDRAL_PHOTOS = [
  { name: 'Cathedral Grand Nave & Altar', url: 'https://images.unsplash.com/photo-1544427920-c49ccfb85579?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Parish Center Banquet Hall', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Cathedral Courtyard & Grotto', url: 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Votive Candle Prayer Sanctuary', url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Garden Courtyard & Benches', url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Reception & Meeting Room', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200' },
  { name: 'Nuptial Liturgical Setting', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200' },
];

export const AdminFacilitiesManager: React.FC<AdminFacilitiesManagerProps> = ({ showToast }) => {
  const [facilities, setFacilities] = useState<Facility[]>(() => facilityService.getAllFacilities());
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('parish-center');
  
  // Active facility being edited
  const activeFacility = facilities.find(f => f.id === selectedFacilityId || f.slug === selectedFacilityId) || facilities[0];

  // Local form states - Media CMS
  const [heroImageInput, setHeroImageInput] = useState('');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Local form states - Master Pricing CMS
  const [basePrice, setBasePrice] = useState<number>(14000);
  const [depositAmount, setDepositAmount] = useState<number>(4200);
  const [additionalCharges, setAdditionalCharges] = useState<number>(1500);
  const [pricingNotes, setPricingNotes] = useState<string>('');
  const [pricingStatus, setPricingStatus] = useState<'active' | 'inactive'>('active');
  const [savingPricing, setSavingPricing] = useState(false);

  // Subscribe to facility changes
  useEffect(() => {
    const unsub = facilityService.subscribe((updated) => {
      setFacilities(updated);
    });
    return () => unsub();
  }, []);

  // Sync state when facility tab changes
  useEffect(() => {
    if (activeFacility) {
      setHeroImageInput(activeFacility.heroImage || '');
      setGalleryImages(activeFacility.gallery || []);
      setBasePrice(activeFacility.basePrice || 0);
      setDepositAmount(activeFacility.depositAmount || 0);
      setAdditionalCharges(activeFacility.additionalCharges || 0);
      setPricingNotes(activeFacility.pricingNotes || '');
      setPricingStatus(activeFacility.pricingStatus || 'active');
    }
  }, [selectedFacilityId, facilities]);

  const handleSaveHeroImage = () => {
    if (!heroImageInput.trim()) return;
    const success = facilityService.updateFacilityHeroImage(activeFacility.id, heroImageInput.trim());
    if (success) {
      showToast(`Header image updated for ${activeFacility.name}!`);
    }
  };

  const handleAddGalleryImage = (urlToAdd?: string) => {
    const url = urlToAdd || newGalleryUrl.trim();
    if (!url) return;

    const updated = [...galleryImages, url];
    setGalleryImages(updated);
    facilityService.updateFacilityGallery(activeFacility.id, updated);
    setNewGalleryUrl('');
    showToast(`Added new photo to ${activeFacility.name} gallery!`);
  };

  const handleRemoveGalleryImage = (indexToRemove: number) => {
    const updated = galleryImages.filter((_, idx) => idx !== indexToRemove);
    setGalleryImages(updated);
    facilityService.updateFacilityGallery(activeFacility.id, updated);
    showToast(`Photo removed from ${activeFacility.name} gallery.`);
  };

  const handleSaveMasterPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPricing(true);

    const result = await facilityService.updateFacilityPricing(activeFacility.id, {
      basePrice: Number(basePrice),
      depositAmount: Number(depositAmount),
      additionalCharges: Number(additionalCharges),
      pricingNotes: pricingNotes.trim(),
      pricingStatus,
    });

    setSavingPricing(false);
    showToast(result.message || `Master pricing saved for ${activeFacility.name}!`);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all facilities photos and gallery to default mock specifications?')) {
      facilityService.resetToDefaults();
      showToast('Facilities photos reset to default specifications.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
            <Building2 className="w-3 h-3" />
            <span>Master Facility & Pricing CMS</span>
          </div>
          <h2 className="font-cathedral text-xl sm:text-2xl font-bold text-slate-900">
            Cathedral Facilities & Master Rates
          </h2>
          <p className="text-xs text-slate-600">
            Control master booking rates, deposit policies, hero banners, and photo galleries synchronized with Netlify Database.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* Facility Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {facilities.map((fac) => (
          <button
            key={fac.id}
            onClick={() => setSelectedFacilityId(fac.id)}
            className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-2.5 shrink-0 cursor-pointer ${
              selectedFacilityId === fac.id || selectedFacilityId === fac.slug
                ? 'bg-[#0171bb] text-white border-[#0171bb] shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {fac.id === 'parish-center' && <Building2 className="w-4 h-4 text-amber-300" />}
            {fac.id === 'grotto' && <Flame className="w-4 h-4 text-amber-300" />}
            {fac.id === 'nativity-chapel' && <Sparkles className="w-4 h-4 text-amber-300" />}
            {fac.id === 'crypt' && <Layers className="w-4 h-4 text-amber-300" />}
            <div className="text-left">
              <span className="block leading-tight">{fac.name}</span>
              <span className={`text-[10px] font-normal block ${selectedFacilityId === fac.id ? 'text-blue-100' : 'text-slate-500'}`}>
                ₱{(fac.basePrice || 0).toLocaleString()} • {fac.pricingStatus || 'active'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* MASTER PRICING CONFIGURATION CARD */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-cathedral text-base font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Master Pricing & Reservation Deposit Rates ({activeFacility?.name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These rates populate public inquiry quotes, deposit computations, and booking contracts.
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            pricingStatus === 'active' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}>
            Status: {pricingStatus}
          </span>
        </div>

        <form onSubmit={handleSaveMasterPricing} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Standard Master Base Rate (₱): *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₱</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={basePrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBasePrice(val);
                    // auto set 30% deposit guideline
                    if (depositAmount === 0 || depositAmount === Math.round(basePrice * 0.3)) {
                      setDepositAmount(Math.round(val * 0.3));
                    }
                  }}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb] font-bold text-slate-900 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-500">Standard 4-hour air-conditioned block.</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Reservation Deposit Due (₱): *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₱</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb] font-bold text-emerald-700 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-500">Required deposit to hold slot (typically 30%).</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Overtime / Additional Hourly Rate (₱):
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">₱</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={additionalCharges}
                  onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb] font-bold text-slate-900 font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-500">Applied for extensions beyond block time.</span>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Pricing Notes & Public Inclusions:
              </label>
              <input
                type="text"
                value={pricingNotes}
                onChange={(e) => setPricingNotes(e.target.value)}
                placeholder="e.g. Includes pro audio technician, standby generator, and 30-min setup buffer."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0171bb]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Pricing Status:
              </label>
              <select
                value={pricingStatus}
                onChange={(e) => setPricingStatus(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0171bb]"
              >
                <option value="active">Active (Accepting Bookings)</option>
                <option value="inactive">Inactive (Suspended / Renovation)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPricing}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingPricing ? 'Saving to Database...' : `Save Master Rates for ${activeFacility?.name}`}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Main Editing Card for Selected Facility - Media CMS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Header/Hero Banner Photo & Sizing Guide */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-cathedral text-base font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#0171bb]" />
                Header / Hero Banner Image
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0171bb] text-[10px] font-bold">
                Primary Showcase
              </span>
            </div>

            {/* Sizing Guide Callout */}
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-950 text-[11px]">
                <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Recommended Header Dimensions & Sizing Guide:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800 pl-1">
                <li><strong>Optimal Resolution:</strong> <code>1920 × 800 px</code> (or 16:9 / 21:9 wide landscape ratio)</li>
                <li><strong>Minimum Width:</strong> <code>1200 px</code> for crisp high-DPI display on retina screens</li>
                <li><strong>Format & Weight:</strong> JPG, PNG, or WebP (max 3 MB recommended for fast mobile loading)</li>
              </ul>
            </div>

            {/* Current Image Preview */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 aspect-[16/8] shadow-inner">
              <img
                src={heroImageInput || activeFacility.heroImage}
                alt={`${activeFacility.name} Header Preview`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=1200';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3 text-white">
                <span className="text-[11px] font-semibold truncate">Current Hero Banner: {activeFacility.name}</span>
              </div>
            </div>

            {/* Header URL Input & Action */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Hero Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={heroImageInput}
                  onChange={(e) => setHeroImageInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0171bb] focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleSaveHeroImage}
                  className="px-4 py-2 rounded-xl bg-[#0171bb] hover:bg-[#015f9e] text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Update Header</span>
                </button>
              </div>
            </div>

            {/* Presets Selector */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Quick Select Cathedral Header Preset:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CATHEDRAL_PHOTOS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setHeroImageInput(preset.url);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Photo Gallery Images & Sizing Guide */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-cathedral text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#0171bb]" />
                Photo Gallery Images ({galleryImages.length})
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                Multi-Photo Carousel
              </span>
            </div>

            {/* Gallery Sizing Guide */}
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-950 text-xs space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-blue-950 text-[11px]">
                <Info className="w-3.5 h-3.5 text-[#0171bb] shrink-0" />
                <span>Recommended Gallery Photo Dimensions:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-800 pl-1">
                <li><strong>Optimal Resolution:</strong> <code>1200 × 800 px</code> (standard 3:2 landscape photo ratio)</li>
                <li><strong>Minimum Width:</strong> <code>800 px</code> (avoids blurry scaling in lightbox modal)</li>
                <li><strong>Orientation:</strong> Landscape orientation recommended for consistent gallery grid presentation</li>
              </ul>
            </div>

            {/* Add Photo Input */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Add New Photo to Gallery (by URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="Paste image URL (https://...)"
                  className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0171bb]"
                />
                <button
                  type="button"
                  onClick={() => handleAddGalleryImage()}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photo</span>
                </button>
              </div>

              {/* Preset quick adds */}
              <div className="pt-1 flex flex-wrap gap-1">
                {PRESET_CATHEDRAL_PHOTOS.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddGalleryImage(p.url)}
                    className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-[9px] transition-colors cursor-pointer"
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid List with Remove Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 block">
                Current Active Photos in {activeFacility.name}:
              </span>

              {galleryImages.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl">
                  No gallery photos yet. Add one above.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {galleryImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-slate-900 group shadow-sm"
                    >
                      <img
                        src={imgUrl}
                        alt={`Gallery ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1548625361-195fe5795df5?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-transform hover:scale-110 flex items-center gap-1 cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Delete</span>
                        </button>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-950/70 text-white text-[9px] font-mono">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
