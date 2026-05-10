'use client';

import { useState } from 'react';

interface Method {
  id: string;
  name: string;
  displayName: string;
}

interface MethodPickerProps {
  methods: Method[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

// Primary methods (shown directly)
const PRIMARY_METHODS = ['v60', 'moka'];

// Other methods (grouped under "Other")
const OTHER_METHODS = ['espresso', 'french_press'];

const V60Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M19 3H5L8.5 17H15.5L19 3Z" />
    <path d="M3 3H21" />
    <path d="M19 5C21 5 22 6.5 22 8C22 9.5 21 11 19 11" />
    <path d="M12 17V21" />
    <path d="M8 21H16" />
  </svg>
);

const MokaPotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M7 2H17L18 6L16 13L18 20L17 22H7L6 20L8 13L6 6L7 2Z" />
    <path d="M12 2V3.5" />
    <path d="M18 8C20 8 21 9 21 11C21 13 20 14 18 14" />
    <path d="M6 11L3 12L6 13" />
  </svg>
);

const FrenchPressIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <rect x="7" y="4" width="10" height="16" rx="1" />
    <path d="M7 6h10" />
    <path d="M12 2v2" />
    <path d="M17 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
    <path d="M9 20h6" />
  </svg>
);

const EspressoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M6 8h12v7a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8z" />
    <path d="M18 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
    <path d="M9 4h6" />
    <path d="M12 2v2" />
  </svg>
);

// Additional icons for the "Other" combined logo (shown as decorative)
const AeropressIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <rect x="8" y="2" width="8" height="4" rx="1" />
    <path d="M9 6v12" />
    <path d="M15 6v12" />
    <path d="M7 18h10l-1 4H8l-1-4z" />
    <path d="M11 2v2" />
    <path d="M13 2v2" />
  </svg>
);

const ChemexIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M6 2h12l-4 8v4l4 8H6l4-8v-4L6 2z" />
    <path d="M10 10h4" />
    <path d="M9 12h6" />
  </svg>
);

const SiphonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <circle cx="12" cy="6" r="4" />
    <path d="M12 10v2" />
    <circle cx="12" cy="17" r="5" />
    <path d="M9 22h6" />
  </svg>
);

const ColdBrewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    <path d="M8 2h8v20H8V2z" />
    <path d="M8 6h8" />
    <path d="M11 2v4" />
    <path d="M13 2v4" />
    <path d="M16 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
    <path d="M10 18h4" />
  </svg>
);

// Combined icon for "Other" showing multiple methods
const OtherMethodsIcon = () => (
  <div className="w-full h-full grid grid-cols-2 gap-0.5 p-0.5">
    <div className="w-full h-full">
      <EspressoIcon />
    </div>
    <div className="w-full h-full">
      <FrenchPressIcon />
    </div>
    <div className="w-full h-full opacity-60">
      <AeropressIcon />
    </div>
    <div className="w-full h-full opacity-60">
      <ChemexIcon />
    </div>
  </div>
);

const methodConfig: Record<string, { icon: React.ReactNode; color: string; gradient: string }> = {
  v60: { 
    icon: <V60Icon />, 
    color: 'from-amber-500 to-orange-600',
    gradient: 'from-amber-50 to-orange-50',
  },
  moka: { 
    icon: <MokaPotIcon />, 
    color: 'from-stone-600 to-stone-800',
    gradient: 'from-stone-50 to-stone-100',
  },
  espresso: { 
    icon: <EspressoIcon />, 
    color: 'from-coffee-700 to-coffee-900',
    gradient: 'from-coffee-50 to-coffee-100',
  },
  french_press: { 
    icon: <FrenchPressIcon />, 
    color: 'from-emerald-600 to-teal-700',
    gradient: 'from-emerald-50 to-teal-50',
  },
  aeropress: {
    icon: <AeropressIcon />,
    color: 'from-blue-600 to-indigo-700',
    gradient: 'from-blue-50 to-indigo-50',
  },
  chemex: {
    icon: <ChemexIcon />,
    color: 'from-rose-500 to-pink-600',
    gradient: 'from-rose-50 to-pink-50',
  },
  siphon: {
    icon: <SiphonIcon />,
    color: 'from-purple-600 to-violet-700',
    gradient: 'from-purple-50 to-violet-50',
  },
  cold_brew: {
    icon: <ColdBrewIcon />,
    color: 'from-cyan-600 to-sky-700',
    gradient: 'from-cyan-50 to-sky-50',
  },
};

export function MethodPicker({ methods, selectedId, onSelect }: MethodPickerProps) {
  const [showOtherMethods, setShowOtherMethods] = useState(false);
  
  // Separate primary and other methods
  const primaryMethods = methods.filter((m) => PRIMARY_METHODS.includes(m.name));
  const otherMethods = methods.filter((m) => OTHER_METHODS.includes(m.name));
  
  // Check if a method from "Other" is selected
  const isOtherSelected = otherMethods.some((m) => m.id === selectedId);
  const selectedOtherMethod = otherMethods.find((m) => m.id === selectedId);

  const renderMethodButton = (method: Method, isSelected: boolean) => {
    const config = methodConfig[method.name] || { 
      icon: <EspressoIcon />, 
      color: 'from-coffee-600 to-coffee-800',
      gradient: 'from-coffee-50 to-coffee-100',
    };
    
    return (
      <button
        key={method.id}
        onClick={() => {
          onSelect(method.id);
          setShowOtherMethods(false);
        }}
        className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl min-w-[85px] sm:min-w-[100px] transition-all duration-300 ${
          isSelected
            ? `bg-gradient-to-br ${config.color} text-white shadow-xl scale-105`
            : `bg-gradient-to-br ${config.gradient} text-coffee-700 border border-coffee-100 hover:border-coffee-200 hover:shadow-md`
        }`}
      >
        {isSelected && (
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.color} opacity-30 blur-xl -z-10`} />
        )}
        
        <div className={`w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2 transition-transform duration-300 ${
          isSelected ? 'scale-110' : ''
        }`}>
          {config.icon}
        </div>
        <span className={`text-xs sm:text-sm font-semibold ${
          isSelected ? 'text-white' : 'text-coffee-800'
        }`}>
          {method.displayName}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      {/* Main method row */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {/* Primary methods */}
        {primaryMethods.map((method) => renderMethodButton(method, selectedId === method.id))}
        
        {/* Other methods button */}
        {otherMethods.length > 0 && (
          <button
            onClick={() => setShowOtherMethods(!showOtherMethods)}
            className={`relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl min-w-[85px] sm:min-w-[100px] transition-all duration-300 ${
              isOtherSelected
                ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-xl scale-105'
                : 'bg-gradient-to-br from-violet-50 to-purple-50 text-coffee-700 border border-coffee-100 hover:border-coffee-200 hover:shadow-md'
            }`}
          >
            {isOtherSelected && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 opacity-30 blur-xl -z-10" />
            )}
            
            <div className={`w-8 h-8 sm:w-10 sm:h-10 mb-1.5 sm:mb-2 transition-transform duration-300 ${
              isOtherSelected || showOtherMethods ? 'scale-110' : ''
            }`}>
              <OtherMethodsIcon />
            </div>
            <span className={`text-xs sm:text-sm font-semibold ${
              isOtherSelected ? 'text-white' : 'text-coffee-800'
            }`}>
              {selectedOtherMethod ? selectedOtherMethod.displayName : 'Other'}
            </span>
            
            {/* Expand indicator */}
            <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs transition-transform ${
              showOtherMethods ? 'rotate-180' : ''
            } ${isOtherSelected ? 'text-white/70' : 'text-coffee-400'}`}>
              ▼
            </span>
          </button>
        )}
      </div>

      {/* Expanded other methods */}
      {showOtherMethods && otherMethods.length > 0 && (
        <div className="bg-coffee-50/50 rounded-xl p-3 animate-slide-up">
          <p className="text-xs text-coffee-500 mb-2 px-1">Choose a method:</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {otherMethods.map((method) => {
              const config = methodConfig[method.name];
              const isSelected = selectedId === method.id;
              
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    onSelect(method.id);
                    setShowOtherMethods(false);
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl min-w-[85px] transition-all duration-200 ${
                    isSelected
                      ? `bg-gradient-to-br ${config?.color || 'from-coffee-600 to-coffee-800'} text-white shadow-lg`
                      : 'bg-white text-coffee-700 border border-coffee-200 hover:border-coffee-300 hover:shadow-md'
                  }`}
                >
                  <div className="w-8 h-8 mb-1">
                    {config?.icon || <EspressoIcon />}
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-coffee-700'}`}>
                    {method.displayName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
