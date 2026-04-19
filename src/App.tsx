import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { MapPin, Star, X, ChevronRight, Moon, Sun, Bell, MessageCircle, Home, CheckCircle2, Navigation, User as UserIcon, Loader2, Plus, ShieldCheck } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { MOCK_STAYS, Stay } from './data/stays';
import { db, auth } from './services/firebase';
import { 
  collection, getDocs, doc, setDoc, query, serverTimestamp, 
  onSnapshot, addDoc, updateDoc, where, deleteDoc
} from 'firebase/firestore';
import { 
  signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User 
} from 'firebase/auth';
import { Toaster, toast } from 'sonner';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Navbar = ({ 
  theme, 
  toggleTheme, 
  location, 
  onLocate, 
  isLocating,
  user,
  isAdmin,
  onLoginClick,
  onAddListing,
  onAdminBoard,
  onDashboardClick
}: {
  theme: 'light' | 'dark',
  toggleTheme: () => void,
  location: string,
  onLocate: () => void,
  isLocating: boolean,
  user: User | null,
  isAdmin: boolean,
  onLoginClick: () => void,
  onAddListing: () => void,
  onAdminBoard: () => void,
  onDashboardClick: () => void
}) => {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setIsHidden(true); // Hide when scrolling down
    } else {
      setIsHidden(false); // Show when scrolling up
    }
    setIsScrolled(latest > 40);
  });

  return (
    <motion.nav 
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={isHidden ? "hidden" : "visible"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 left-0 right-0 z-50 py-4 px-4 md:px-12 pointer-events-none"
    >
      <motion.div 
        layout
        transition={{ duration: 0.3, ease: 'circOut' }}
        className={`pointer-events-auto max-w-[1400px] mx-auto flex items-center justify-between rounded-full px-6 py-3 transition-all duration-500
          ${isScrolled 
            ? 'bg-card shadow-lg border border-noir/10' 
            : 'bg-transparent border-transparent'
          }
        `}
      >
        
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-maroon rounded-full flex items-center justify-center text-cotton font-serif font-bold text-lg shadow-md">
            U
          </div>
          <span className="text-lg font-serif italic text-noir hidden sm:block">UniStay</span>
        </div>

        {/* Center: Location tracker */}
        <div className={`flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full group transition-all duration-500 ${isScrolled ? 'bg-noir/5 dark:bg-cotton/10 border border-noir/10' : 'bg-noir/5 dark:bg-cotton/5'}`}>
          <button 
            onClick={onLocate}
            disabled={isLocating}
            className="p-1.5 hover:bg-noir/5 rounded-full text-noir/60 hover:text-cherry transition-colors disabled:opacity-50"
            title="Use GPS tracking"
          >
            {isLocating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
          </button>
          <span className="text-xs font-medium text-noir truncate max-w-[120px]">{location}</span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-4 text-noir/80">
          <button onClick={toggleTheme} className="p-1.5 hover:text-cherry hover:bg-noir/5 rounded-full transition-all">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Bell className="w-4 h-4 cursor-pointer hover:text-cherry transition-colors hidden sm:block" />
          
          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-noir/10">
              {isAdmin && (
                <button onClick={onAdminBoard} className="text-xs font-bold hover:text-cherry uppercase tracking-widest text-maroon transition-colors" title="Admin">
                  <span className="hidden sm:block">Admin</span>
                  <ShieldCheck className="w-4 h-4 sm:hidden" />
                </button>
              )}
              <button onClick={onAddListing} className="text-xs font-bold hover:text-cherry uppercase tracking-widest transition-colors" title="Host">
                <span className="hidden sm:block">Host</span>
                <Plus className="w-4 h-4 sm:hidden" />
              </button>
              <button onClick={onDashboardClick} className="text-xs font-bold hover:text-cherry uppercase tracking-widest transition-colors" title="Dashboard">
                <span className="hidden sm:block">Dashboard</span>
                <UserIcon className="w-4 h-4 sm:hidden" />
              </button>
              <button onClick={() => signOut(auth)} className="text-xs font-bold hover:text-cherry uppercase tracking-widest text-noir/50 transition-colors" title="Logout">
                <span className="hidden sm:block">Logout</span>
                <X className="w-4 h-4 sm:hidden" />
              </button>
              <img src={user.photoURL || 'https://i.pravatar.cc/150'} alt="Profile" className="w-8 h-8 rounded-full border-2 border-cotton shadow-sm hover:scale-105 transition-transform" referrerPolicy="no-referrer" title={user.displayName || ''} />
            </div>
          ) : (
            <div className="pl-3 border-l border-noir/10">
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase bg-noir text-cotton px-4 py-2 rounded-full hover:bg-maroon hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

      </motion.div>
    </motion.nav>
  );
};

const Hero = ({ onBookingComplete }: { onBookingComplete: () => void }) => {
  const [selectedOption, setSelectedOption] = useState(1);

  return (
    <section className="pt-32 md:pt-48 pb-20 px-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center min-h-[85vh]">
      <div>
        <h1 className="text-6xl md:text-7xl lg:text-[7rem] font-serif leading-[1.05] tracking-tight text-noir mb-6 transition-colors duration-300">
          Student rentals<br />
          <span className="text-cherry italic">curated</span><br />
          for you.
        </h1>
        <p className="text-lg md:text-xl text-noir/80 max-w-md leading-relaxed font-light transition-colors duration-300 mb-6">
          Skip the endless profiles and upfront commitments. An exclusive, premium service that is completely free of charge.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-green-100 text-green-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-200">100% Free</span>
          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-blue-200">Exclusive Access</span>
          <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-purple-200">Premium Service</span>
        </div>
      </div>

      <div className="bg-card rounded-[2rem] border border-noir/10 shadow-[0_8px_30px_rgb(27,23,23,0.08)] p-8 md:p-10 lg:ml-auto w-full max-w-lg transition-colors duration-300">
        <h2 className="text-3xl font-serif text-noir mb-8 tracking-tight">Instant Matching</h2>
        
        <div className="mb-6 flex items-center gap-3">
          <span className="bg-cherry text-cotton font-bold w-6 h-6 rounded flex items-center justify-center text-xs">1</span>
          <span className="text-[11px] font-bold text-noir/60 tracking-widest uppercase">When do you need to move in?</span>
        </div>

        <div className="space-y-4 mb-8">
          <button 
            onClick={() => setSelectedOption(1)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${
              selectedOption === 1 
                ? 'border-cherry bg-cherry/5' 
                : 'border-noir/10 hover:border-cherry/50 bg-card'
            }`}
          >
            <span className={`font-medium ${selectedOption === 1 ? 'text-cherry' : 'text-noir'}`}>
              Now (Emergency Room)
            </span>
            {selectedOption === 1 && (
              <span className="bg-cherry/10 text-cherry text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                Fast Track
              </span>
            )}
          </button>

          <button 
            onClick={() => setSelectedOption(2)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center ${
              selectedOption === 2 
                ? 'border-cherry bg-cherry/5' 
                : 'border-noir/10 hover:border-cherry/50 bg-card'
            }`}
          >
            <span className={`font-medium ${selectedOption === 2 ? 'text-cherry' : 'text-noir'}`}>
              Sometime This Week
            </span>
          </button>

          <button 
            onClick={() => setSelectedOption(3)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center ${
              selectedOption === 3 
                ? 'border-cherry bg-cherry/5' 
                : 'border-noir/10 hover:border-cherry/50 bg-card'
            }`}
          >
            <span className={`font-medium ${selectedOption === 3 ? 'text-cherry' : 'text-noir'}`}>
              Browse & Decide Later
            </span>
          </button>
        </div>

        <button 
          onClick={onBookingComplete}
          className="w-full bg-noir hover:bg-maroon text-cotton font-medium py-4 rounded-xl transition-colors shadow-lg shadow-noir/20 text-lg"
        >
          View Listings
        </button>
      </div>
    </section>
  );
};

const StayCard = ({ stay, onClick, isFavorite, onToggleFavorite }: { stay: Stay; onClick: () => void; isFavorite?: boolean; onToggleFavorite?: (e: React.MouseEvent) => void; key?: React.Key }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -4 }}
    className="bg-card rounded-3xl border border-noir/10 overflow-hidden cursor-pointer group hover:shadow-xl hover:border-cherry/30 transition-all duration-300 relative"
    onClick={onClick}
  >
    <div className="relative h-60 overflow-hidden">
      <img 
        src={stay.image} 
        alt={stay.name} 
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      
      {/* Heart Icon Overlay */}
      {onToggleFavorite && (
        <button 
          onClick={onToggleFavorite}
          className="absolute top-4 right-4 z-10 bg-card/80 backdrop-blur-sm p-2 rounded-full shadow-sm hover:scale-110 transition-transform"
        >
          <svg viewBox="0 0 24 24" fill={isFavorite ? '#8C1C13' : 'none'} stroke={isFavorite ? '#8C1C13' : '#1B1717'} strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      )}

      <div className="absolute top-4 left-4 bg-card/95 px-3 py-1.5 rounded-lg text-xs font-bold text-noir tracking-wider border border-noir/10 uppercase transition-colors">
        {stay.type}
      </div>
      {stay.price ? (
        <div className="absolute bottom-4 left-4 bg-card/95 px-3 py-1.5 rounded-lg text-sm font-bold text-noir tracking-wider shadow-lg">
          ₹{stay.price}/mo
        </div>
      ) : null}
      <div className="absolute top-14 right-4 bg-card/95 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-noir border border-noir/10 transition-colors">
        <Star className="w-3.5 h-3.5 text-cherry fill-current" /> {stay.rating || 5.0}
      </div>
      <div className="absolute bottom-4 right-4 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
         <span className="bg-maroon text-cotton px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg">
           View property
         </span>
      </div>
    </div>
    <div className="p-6">
      <h3 className="text-xl font-serif text-noir mb-2">{stay.name}</h3>
      <div className="flex items-center gap-1.5 text-noir/60 text-sm mb-4 font-light">
        <MapPin className="w-4 h-4" /> {stay.location}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {(stay.amenities || []).slice(0, 3).map(amenity => (
          <span key={amenity} className="bg-cotton/40 border border-noir/5 text-noir/80 px-2.5 py-1 rounded-md text-xs font-medium tracking-wide">
            {amenity}
          </span>
        ))}
      </div>
      <div className="pt-5 border-t border-noir/5 flex items-center justify-between">
        <span className="text-xs font-medium text-noir/60 flex items-center gap-1 uppercase tracking-widest">
          {stay.distanceToUni || '1.0 km'}
        </span>
        <button className="text-cherry font-medium text-sm flex items-center gap-1 transition-all group-hover:gap-2">
          Details <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

const StayModal = ({ stay, onClose, onRequest, loading }: { stay: Stay; onClose: () => void, onRequest: () => void, loading: boolean }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-noir/50 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.95, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.95, y: 20 }}
      className="bg-card w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative transition-colors duration-300"
      onClick={e => e.stopPropagation()}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-card/80 backdrop-blur-md hover:bg-cotton p-2 rounded-full text-noir transition-all shadow-sm"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="md:w-1/2 h-64 md:h-auto">
        <img src={stay.image} alt={stay.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <div className="md:w-1/2 p-8 overflow-y-auto max-h-[80vh] md:max-h-[600px] flex flex-col justify-between">
        <div>
          <div className="mb-6">
            <span className="text-cherry font-bold text-xs uppercase tracking-widest mb-2 block">{stay.type}</span>
            <h2 className="text-3xl font-serif text-noir mb-2">{stay.name}</h2>
            <div className="flex items-center gap-1.5 text-noir/60 text-sm font-light">
              <MapPin className="w-4 h-4" /> {stay.location}
            </div>
          </div>

          <div className="bg-cotton/30 rounded-2xl p-4 mb-6 flex justify-between items-center border border-noir/5">
            <div>
              <span className="text-noir/50 text-[10px] uppercase font-bold tracking-widest block mb-1">Distance</span>
              <span className="font-medium text-noir">{stay.distanceToUni || '1.0 km'}</span>
            </div>
            <div className="text-right border-l border-noir/10 pl-6">
              <span className="text-noir/50 text-[10px] uppercase font-bold tracking-widest block mb-1">Rating</span>
              <span className="text-lg font-bold flex items-center justify-end gap-1.5 text-noir">
                {stay.rating || 5.0} <Star className="w-4 h-4 text-cherry fill-current" />
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-serif italic text-noir mb-3 text-lg">
              About the property
            </h4>
            <p className="text-noir/70 leading-relaxed text-sm font-light">
              {stay.description} Elegantly furnished and rigorously verified, providing a pristine environment tailored for modern students.
            </p>
          </div>

          <div className="mb-8">
            <h4 className="font-serif italic text-noir mb-3 text-lg">
              Amenities
            </h4>
            <div className="flex flex-wrap gap-2">
              {(stay.amenities || []).map(amenity => (
                <span key={amenity} className="px-3 py-1.5 bg-cotton/50 border border-noir/10 rounded-lg text-noir/80 text-xs font-medium tracking-wide">
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-maroon/5 border border-maroon/20 rounded-2xl p-4 mb-4 mt-2">
          <h4 className="text-xs font-bold text-maroon uppercase tracking-widest mb-3 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/> The UniStay Promise</h4>
          <ul className="space-y-2 text-xs text-noir/80 font-medium">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> 100% Free of Charge for Students</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Exclusive & Curated Listings</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Direct Access, Zero Middlemen</li>
          </ul>
        </div>

        <button 
          onClick={onRequest}
          disabled={loading}
          className="w-full bg-noir text-cotton py-4 rounded-xl font-medium text-lg hover:bg-maroon transition-colors shadow-md mt-4 disabled:opacity-50 flex items-center justify-center"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Request viewing"}
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const AddListingModal = ({ onClose, user }: { onClose: () => void, user: User }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    type: 'PG',
    description: '',
    price: '',
    image: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location || !formData.description) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'stays'), {
        name: formData.name,
        location: formData.location,
        type: formData.type,
        description: formData.description,
        price: Number(formData.price) || 0,
        image: formData.image || ('https://picsum.photos/seed/' + Math.random().toString(36) + '/800/600'),
        amenities: ['Verified by Admin', 'Ready to move'],
        distanceToUni: 'Contact for details',
        rating: 5.0,
        ownerId: user.uid,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success('Property securely submitted!', { description: 'It will appear publicly once approved by an Admin.' });
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error('Submission Failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-noir/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="bg-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-noir/60 hover:text-noir transition-colors"><X className="w-5 h-5"/></button>
        <h2 className="text-3xl font-serif text-noir mb-2">Host a Property</h2>
        <p className="text-noir/60 font-light text-sm mb-6">Submit your listing for the UniStay curated collection. All submissions undergo manual review.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-noir/50 mb-1 block">Property Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-cotton/50 border border-noir/10 rounded-xl p-3 text-noir outline-none focus:border-cherry" placeholder="e.g. The Grand Residence" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-noir/50 mb-1 block">General Location</label>
            <input required type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-cotton/50 border border-noir/10 rounded-xl p-3 text-noir outline-none focus:border-cherry" placeholder="e.g. North Campus District" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-noir/50 mb-1 block">Property Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-cotton/50 border border-noir/10 rounded-xl p-3 text-noir outline-none focus:border-cherry">
              <option value="PG">PG (Paying Guest)</option>
              <option value="Hostel">Hostel</option>
              <option value="Flat">Flat / Apartment</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-widest text-noir/50 mb-1 block">Monthly Rent</label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-cotton/50 border border-noir/10 rounded-xl p-3 text-noir outline-none focus:border-cherry" placeholder="e.g. 5000" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold uppercase tracking-widest text-noir/50 mb-1 block">Image URL</label>
              <input type="url" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-cotton/50 border border-noir/10 rounded-xl p-3 text-noir outline-none focus:border-cherry" placeholder="https://..." />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-noir/50 mb-1 block">Description</label>
            <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-cotton/50 border border-noir/10 rounded-xl p-3 text-noir outline-none focus:border-cherry" placeholder="Describe the atmosphere..." />
          </div>
          
          <button type="submit" disabled={loading} className="w-full bg-noir text-cotton py-4 rounded-xl font-medium text-lg hover:bg-maroon transition-colors shadow-md mt-4 disabled:opacity-50 flex justify-center">
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit for Review"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const AdminDashboardModal = ({ onClose }: { onClose: () => void }) => {
  const [pending, setPending] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'stays'), where('status', '==', 'pending'));
    const un = onSnapshot(q, (snap) => {
      setPending(snap.docs.map(d => ({ id: d.id, ...d.data() } as Stay)));
      setLoading(false);
    });
    return un;
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'stays', id), { status: 'approved', updatedAt: serverTimestamp() });
      toast.success('Property Approved');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, 'stays', id), { status: 'rejected', updatedAt: serverTimestamp() });
      toast.success('Property Rejected');
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-noir/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        className="bg-card w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative p-8 h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-noir/60 hover:text-noir transition-colors"><X className="w-6 h-6"/></button>
        
        <div className="flex items-center gap-3 mb-6 border-b border-noir/10 pb-4">
           <ShieldCheck className="w-8 h-8 text-maroon" />
           <div>
             <h2 className="text-3xl font-serif text-noir">Admin Governance</h2>
             <p className="text-noir/60 font-light text-sm">Reviewing {pending.length} pending property submissions.</p>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {loading && <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-maroon" /></div>}
          {!loading && pending.length === 0 && (
             <div className="text-center py-20 text-noir/50 font-light italic">No pending submissions awaiting review.</div>
          )}
          {pending.map(stay => (
            <div key={stay.id} className="border border-noir/10 p-5 rounded-2xl bg-cotton/20 flex flex-col md:flex-row gap-5 items-center justify-between">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-maroon text-cotton text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-widest">{stay.type}</span>
                    <h4 className="font-serif text-xl">{stay.name}</h4>
                  </div>
                  <p className="text-sm font-light text-noir/70 mb-2"><MapPin className="w-3 h-3 inline mr-1"/>{stay.location}</p>
                  <p className="text-xs text-noir/60 max-w-md line-clamp-2">{stay.description}</p>
               </div>
               <div className="flex gap-3 w-full md:w-auto">
                 <button onClick={() => handleApprove(stay.id)} className="flex-1 md:w-auto px-6 py-2 bg-noir text-cotton rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">Approve</button>
                 <button onClick={() => handleReject(stay.id)} className="flex-1 md:w-auto px-6 py-2 border border-cherry text-cherry rounded-lg hover:bg-cherry/10 transition-colors text-sm font-medium">Reject</button>
               </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const AssistantFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const askAssistant = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an elegant student housing concierge.
      A student says: "${input}". 
      Based on these available verified stays (NO PRICES ARE DISPLAYED to users): ${JSON.stringify(MOCK_STAYS)}, 
      recommend options based on amenities and location. Speak with a sophisticated, professional, concierge tone.`;
      
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setResponse(result.text || "Pardon the interruption, I could not process your request.");
    } catch (error) {
      console.error(error);
      setResponse("Our concierge is momentarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-card w-80 md:w-96 rounded-[2rem] shadow-[0_8px_30px_rgb(27,23,23,0.15)] border border-noir/10 overflow-hidden mb-4 transition-colors"
          >
            <div className="bg-maroon p-5 text-cotton flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-cotton/10 rounded-full flex items-center justify-center border border-cotton/20">
                  <span className="font-serif italic text-sm">U</span>
                </div>
                <div>
                  <h3 className="font-serif italic text-lg leading-tight">Concierge</h3>
                  <p className="text-[10px] text-cotton/80 font-bold tracking-widest uppercase">Select Rentals</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-cotton/20 p-1.5 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5">
              <div className="h-64 overflow-y-auto mb-4 text-sm text-noir/80 no-scrollbar relative flex flex-col justify-end font-light">
                {response ? (
                  <div className="bg-cotton/40 p-4 rounded-2xl rounded-tl-sm border border-noir/5 self-start">
                    {response}
                  </div>
                ) : (
                  <div className="bg-cotton/40 p-4 rounded-2xl rounded-tl-sm border border-noir/5 self-start">
                    Good day. Tell us your preferences involving location or lifestyle, and we shall identify the ideal residence for you.
                  </div>
                )}
                {loading && (
                   <div className="bg-cotton/40 p-4 rounded-2xl rounded-tl-sm border border-noir/5 self-start mt-4 flex gap-1 items-center">
                     <div className="w-1.5 h-1.5 bg-cherry/50 rounded-full animate-bounce" />
                     <div className="w-1.5 h-1.5 bg-cherry/50 rounded-full animate-bounce delay-75" />
                     <div className="w-1.5 h-1.5 bg-cherry/50 rounded-full animate-bounce delay-150" />
                   </div>
                )}
              </div>
              <div className="flex gap-2 items-center bg-cotton/30 rounded-full border border-noir/10 p-1 pl-4">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askAssistant()}
                  placeholder="Inquire about property..."
                  className="flex-1 bg-transparent text-sm text-noir outline-none placeholder:text-noir/40 font-light"
                />
                <button 
                  onClick={askAssistant}
                  disabled={loading || !input.trim()}
                  className="bg-noir text-cotton w-8 h-8 rounded-full flex items-center justify-center hover:bg-cherry transition-colors disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-noir text-cotton rounded-full flex items-center justify-center shadow-xl shadow-noir/20 hover:scale-105 hover:bg-maroon border border-cotton/10 transition-all"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};

const AuthModal = ({ onClose, onComplete }: { onClose: () => void, onComplete: (user: User) => void }) => {
  const [loading, setLoading] = useState(false);

  const mockGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      await setDoc(doc(db, 'users', result.user.uid), {
        email: result.user.email,
        name: result.user.displayName || 'Student',
        avatar: result.user.photoURL || '',
        createdAt: serverTimestamp(),
        role: 'user'
      }, { merge: true });

      toast.success('Signed in successfully', { description: `Welcome back, ${result.user.displayName || 'Student'}` });
      onComplete(result.user);
    } catch (error: any) {
      console.error(error);
      toast.error('Authentication Error', { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-noir/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-card w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative p-8 transition-colors duration-300"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-noir/60 hover:text-noir transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-maroon rounded-full flex items-center justify-center text-cotton font-serif font-bold text-2xl shadow-sm mx-auto mb-4">
            U
          </div>
          <h2 className="text-2xl font-serif text-noir mb-2">Welcome to UniStay</h2>
          <p className="text-noir/60 font-light text-sm">Sign in to securely access curated properties and fast-track instant matching.</p>
        </div>

        <button 
          onClick={mockGoogleLogin}
          disabled={loading}
          className="w-full bg-cotton hover:bg-cotton/80 border border-noir/10 text-noir font-medium py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-noir/50" />
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>
        
        <p className="text-center text-noir/40 text-[10px] uppercase font-bold tracking-widest mt-8">
          Secure Educational Portal
        </p>
      </motion.div>
    </motion.div>
  );
};

const UserDashboard = ({ onClose, user }: { onClose: () => void, user: User }) => {
  const [requests, setRequests] = useState<any[]>([]);
  const [inboundRequests, setInboundRequests] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<Stay[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    // 1. My Outbound Requests
    const unReq = onSnapshot(query(collection(db, 'viewing_requests'), where('userId', '==', user.uid)), snap => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    
    // 2. My Properties
    const unList = onSnapshot(query(collection(db, 'stays'), where('ownerId', '==', user.uid)), snap => {
      setMyListings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Stay)));
    });

    // 3. Inbound requests for my properties (requires listing IDs)
    // First wait for listings to load to get IDs, but querying directly is complex without cloud fn. 
    // We'll fetch all requests and client filter for now since it's an MVP prototype.
    const unInbound = onSnapshot(query(collection(db, 'viewing_requests')), snap => {
       const mapped = snap.docs.map(d => ({ id: d.id, ...d.data() }));
       // We'll filter `inboundRequests` inline based on `myListings` IDs since 'in' query is limited to 10.
       setInboundRequests(mapped);
    });
    
    // 4. Favorites
    const unFav = onSnapshot(query(collection(db, 'favorites'), where('userId', '==', user.uid)), snap => {
       setFavorites(snap.docs.map(d => ({ id: d.id, stayId: d.data().stayId })));
    });

    return () => { unReq(); unList(); unInbound(); unFav(); };
  }, [user.uid]);

  const respondToRequest = async (id: string, status: 'fulfilled' | 'cancelled') => {
     try {
       await updateDoc(doc(db, 'viewing_requests', id), { status, updatedAt: serverTimestamp() });
       toast.success(`Request ${status === 'fulfilled' ? 'accepted' : 'declined'}`);
     } catch (e: any) { toast.error(e.message); }
  };

  const myListingIds = myListings.map(l => l.id);
  const actualInbound = inboundRequests.filter(r => myListingIds.includes(r.stayId));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-noir/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl relative p-8 h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-noir/60 hover:text-noir transition-colors"><X className="w-6 h-6"/></button>
        <h2 className="text-3xl font-serif text-noir mb-6 border-b border-noir/10 pb-4">My Dashboard</h2>
        
        <div className="flex-1 overflow-y-auto space-y-12 pr-2 grid md:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: Student Actions */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-serif text-noir mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> My Outbound Requests</h3>
              {requests.length === 0 ? <p className="text-sm text-noir/50 italic">No viewing requests submitted.</p> : requests.map(req => (
                <div key={req.id} className="border border-noir/10 p-4 rounded-xl mb-3 flex justify-between items-center bg-cotton/30">
                  <div>
                    <h4 className="font-bold text-sm">Target: {req.stayId.slice(0, 6)}...</h4>
                    <p className="text-xs text-noir/60">Sent on: {new Date(req.createdAt?.toDate?.() || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-1 rounded tracking-widest bg-noir text-cotton">{req.status}</span>
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-xl font-serif text-noir mb-4 flex items-center gap-2">⭐ Favorites ({favorites.length})</h3>
              {favorites.length === 0 ? <p className="text-sm text-noir/50 italic">You have no saved favorites yet.</p> : (
                 <div className="text-sm text-noir/60 bg-cotton/50 p-4 border border-noir/10 rounded-xl">
                   You have {favorites.length} saved properties. Return to the home screen to view them!
                 </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: Host Actions */}
          <div className="space-y-8 border-t md:border-t-0 md:border-l border-noir/10 md:pl-8 pt-8 md:pt-0">
            <section>
              <h3 className="text-xl font-serif text-noir mb-4 flex items-center gap-2"><Home className="w-5 h-5"/> My Portfolio</h3>
              {myListings.length === 0 ? <p className="text-sm text-noir/50 italic">You haven't listed any properties yet.</p> : myListings.map(stay => (
                <div key={stay.id} className="border border-noir/10 p-4 rounded-xl mb-3 flex justify-between items-center bg-cotton/30">
                  <div>
                    <h4 className="font-bold text-sm">{stay.name}</h4>
                    <p className="text-xs text-noir/60">{stay.location} • ₹{stay.price}/mo</p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded tracking-widest ${stay.status === 'approved' ? 'bg-green-100 text-green-700' : stay.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{stay.status}</span>
                </div>
              ))}
            </section>

            <section>
              <h3 className="text-xl font-serif text-noir mb-4 flex items-center gap-2"><Bell className="w-5 h-5"/> Inbound Lead Requests</h3>
              {actualInbound.length === 0 ? <p className="text-sm text-noir/50 italic">No incoming student requests.</p> : actualInbound.map(req => (
                <div key={req.id} className="border border-maroon/20 p-4 rounded-xl mb-3 bg-red-50/10">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h4 className="font-bold text-sm">Lead for stay: {req.stayId.slice(0,4)}</h4>
                      <p className="text-xs text-noir/60">From UID: {req.userId.slice(0, 5)}...</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-1 rounded tracking-widest bg-maroon text-cotton">{req.status}</span>
                  </div>
                  {req.status === 'pending' && (
                     <div className="flex gap-2 mt-2">
                       <button onClick={() => respondToRequest(req.id, 'fulfilled')} className="flex-1 bg-noir text-cotton text-xs py-1.5 rounded-lg hover:bg-green-700">Accept Viewer</button>
                       <button onClick={() => respondToRequest(req.id, 'cancelled')} className="flex-1 border border-noir/20 text-xs py-1.5 rounded-lg hover:bg-noir/5">Decline</button>
                     </div>
                  )}
                </div>
              ))}
            </section>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
};

export default function App() {
  const [selectedStay, setSelectedStay] = useState<Stay | null>(null);
  const [activeFilter, setActiveFilter] = useState<'All' | 'PG' | 'Hostel' | 'Flat'>('All');
  
  // States
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [location, setLocation] = useState('Select City');
  const [isLocating, setIsLocating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAddListing, setShowAddListing] = useState(false);
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  // Data
  const [stays, setStays] = useState<Stay[]>([]);
  const [favorites, setFavorites] = useState<{id: string, stayId: string}[]>([]);
  const [isRequesting, setIsRequesting] = useState(false);

  // Authentication Listener & Admin Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email === 'ishansrivastavaaa@gmail.com') {
         setIsAdmin(true);
      } else {
         setIsAdmin(false);
      }
    });
    return unsubscribe;
  }, []);

  // Fetch Approved Stays & Favorites
  useEffect(() => {
    const q = query(collection(db, 'stays'), where('status', '==', 'approved'));
    const unStays = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
         setStays(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Stay));
      } else {
         setStays(MOCK_STAYS);
      }
    }, () => setStays(MOCK_STAYS));

    let unFav = () => {};
    if (user) {
       unFav = onSnapshot(query(collection(db, 'favorites'), where('userId', '==', user.uid)), snap => {
          setFavorites(snap.docs.map(d => ({ id: d.id, stayId: d.data().stayId })));
       });
    }

    return () => { unStays(); unFav(); };
  }, [user]);

  const toggleFavorite = async (e: React.MouseEvent, stayId: string) => {
     e.stopPropagation();
     if (!user) {
        setShowAuthModal(true); return;
     }
     const existing = favorites.find(f => f.stayId === stayId);
     try {
       if (existing) {
         await deleteDoc(doc(db, 'favorites', existing.id));
         toast.success('Removed from favorites');
       } else {
         await addDoc(collection(db, 'favorites'), { userId: user.uid, stayId, createdAt: serverTimestamp() });
         toast.success('Added to favorites');
       }
     } catch (err: any) { toast.error(err.message); }
  };

  // Apply Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // GPS Location Tracker
  const locateUser = () => {
    if (!("geolocation" in navigator)) return toast.error("Geolocation is not supported by your browser");
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
        const data = await res.json();
        
        const city = data.city || data.locality || data.principalSubdivision;
        const country = data.countryCode || '';
        if (city) {
          setLocation(`${city}${country ? `, ${country}` : ''}`);
        } else {
          setLocation("Location Found");
        }
      } catch (e) {
        setLocation("Location detected");
      } finally {
        setIsLocating(false);
      }
    }, () => {
      toast.error("Unable to retrieve your location");
      setIsLocating(false);
    });
  };

  const filteredStays = useMemo(() => {
    if (activeFilter === 'All') return stays;
    return stays.filter(stay => stay.type === activeFilter);
  }, [activeFilter, stays]);

  const scrollToListings = () => {
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRequestViewing = async () => {
    if (!selectedStay) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsRequesting(true);
    try {
      await addDoc(collection(db, 'viewing_requests'), {
        userId: user.uid,
        stayId: selectedStay.id,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      toast.success('Request sent successfully', { description: 'The concierge will contact you shortly.' });
      setSelectedStay(null);
    } catch (e: any) {
      if (e.message.includes('Missing or insufficient permissions')) {
        toast.error("Access Denied", { description: "Please ensure your account is fully verified." });
      } else {
        toast.error("Failed to submit request. Please try again.");
      }
      console.error(e);
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" richColors theme={theme} toastOptions={{ className: 'font-serif tracking-wide border-noir/10 shadow-xl' }} />
      <Navbar 
        theme={theme}
        toggleTheme={toggleTheme}
        location={location}
        onLocate={locateUser}
        isLocating={isLocating}
        user={user}
        isAdmin={isAdmin}
        onLoginClick={() => setShowAuthModal(true)}
        onAddListing={() => setShowAddListing(true)}
        onAdminBoard={() => setShowAdminBoard(true)}
        onDashboardClick={() => setShowDashboard(true)}
      />
      
      <Hero onBookingComplete={scrollToListings} />

      <main id="listings" className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8 pb-8 border-b border-noir/10">
          <div>
            <h2 className="text-4xl font-serif text-noir mb-3">Curated Collection</h2>
            <p className="text-noir/60 font-light">Refined selections matching your lifestyle</p>
          </div>
          
          <div className="flex items-center gap-2">
            {(['All', 'PG', 'Hostel', 'Flat'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all border ${
                  activeFilter === filter 
                    ? 'border-noir bg-noir text-cotton' 
                    : 'border-noir/10 bg-card text-noir/60 hover:border-noir/30 hover:text-noir'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredStays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredStays.map((stay: Stay) => (
                <StayCard 
                  key={stay.id} 
                  stay={stay} 
                  onClick={() => setSelectedStay(stay)} 
                  isFavorite={favorites.some(f => f.stayId === stay.id)}
                  onToggleFavorite={(e) => toggleFavorite(e, stay.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-24 bg-card border border-noir/10 rounded-3xl transition-colors duration-300">
            <div className="w-16 h-16 bg-cotton rounded-full flex items-center justify-center mx-auto mb-6">
              <Home className="w-8 h-8 text-noir/30" />
            </div>
            <h3 className="text-2xl font-serif text-noir mb-3">No matching records</h3>
            <p className="text-noir/60 font-light">Consider adjusting your requirements to view more selections.</p>
          </div>
        )}
      </main>

      <AssistantFAB />

      {/* Modals */}
      <AnimatePresence>
        {selectedStay && (
          <StayModal 
            stay={selectedStay} 
            onClose={() => setSelectedStay(null)}
            onRequest={handleRequestViewing}
            loading={isRequesting}
          />
        )}
        
        {showAddListing && user && (
          <AddListingModal onClose={() => setShowAddListing(false)} user={user} />
        )}

        {showAdminBoard && isAdmin && (
          <AdminDashboardModal onClose={() => setShowAdminBoard(false)} />
        )}

        {showDashboard && user && (
          <UserDashboard onClose={() => setShowDashboard(false)} user={user} />
        )}

        {showAuthModal && (
          <AuthModal 
            onClose={() => setShowAuthModal(false)}
            onComplete={(u) => {
              setUser(u);
              setShowAuthModal(false);
            }}
          />
        )}
      </AnimatePresence>
      
      <footer className="bg-noir text-cotton py-12 text-center text-sm font-light mt-20 border-t-4 border-maroon">
        <div className="font-serif italic text-2xl mb-4 text-cotton/90">UniStay</div>
        <p className="text-cotton/50 tracking-widest uppercase text-[10px]">© {new Date().getFullYear()} Exclusive Educational Accommodations</p>
      </footer>
    </div>
  );
}
