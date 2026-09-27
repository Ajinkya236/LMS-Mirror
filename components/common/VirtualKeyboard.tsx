import React, { useState, useEffect } from 'react';
import { Delete, CornerDownLeft, Globe, ArrowUp, X, Keyboard as KeyboardIcon } from 'lucide-react';

interface VirtualKeyboardProps {
  onKeyPress?: (key: string) => void;
  onBackspace?: () => void;
  onEnter?: () => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onEnter,
  onClose,
  isOpen = true
}) => {
  const [layout, setLayout] = useState<'letters' | 'numbers'>('letters');
  const [isShift, setIsShift] = useState<boolean>(false);

  const letterRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  const numberRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['.', ',', '?', '!', "'", '#', '_']
  ];

  const currentRows = layout === 'letters' ? letterRows : numberRows;

  const handleKeyClick = (key: string) => {
    const finalKey = isShift ? key.toUpperCase() : key;
    
    // Dispatch to active document element if no handler provided
    if (onKeyPress) {
      onKeyPress(finalKey);
    } else {
      const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        const start = activeEl.selectionStart ?? activeEl.value.length;
        const end = activeEl.selectionEnd ?? activeEl.value.length;
        const currentVal = activeEl.value;
        const newVal = currentVal.substring(0, start) + finalKey + currentVal.substring(end);
        
        // Trigger React onChange
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set || Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value'
        )?.set;

        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(activeEl, newVal);
          activeEl.dispatchEvent(new Event('input', { bubbles: true }));
          activeEl.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          activeEl.value = newVal;
        }

        setTimeout(() => {
          activeEl.setSelectionRange(start + 1, start + 1);
        }, 0);
      }
    }
  };

  const handleBackspace = () => {
    if (onBackspace) {
      onBackspace();
    } else {
      const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        const start = activeEl.selectionStart ?? activeEl.value.length;
        const end = activeEl.selectionEnd ?? activeEl.value.length;
        if (start === end && start > 0) {
          const newVal = activeEl.value.substring(0, start - 1) + activeEl.value.substring(end);
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set || Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype,
            'value'
          )?.set;

          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(activeEl, newVal);
            activeEl.dispatchEvent(new Event('input', { bubbles: true }));
            activeEl.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            activeEl.value = newVal;
          }
          setTimeout(() => {
            activeEl.setSelectionRange(start - 1, start - 1);
          }, 0);
        } else if (start !== end) {
          const newVal = activeEl.value.substring(0, start) + activeEl.value.substring(end);
          activeEl.value = newVal;
          activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  };

  const handleEnter = () => {
    if (onEnter) {
      onEnter();
    } else {
      const activeEl = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
      if (activeEl) {
        if (activeEl.tagName === 'TEXTAREA') {
          handleKeyClick('\n');
        } else if (activeEl.form) {
          activeEl.form.requestSubmit();
        }
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[999999] bg-slate-900/95 backdrop-blur-md border-t border-white/20 p-2 sm:p-3 shadow-2xl animate-fade-in select-none max-w-xl mx-auto rounded-t-2xl sm:mb-1">
      {/* Top Helper Bar */}
      <div className="flex items-center justify-between px-2 pb-1.5 text-xs text-gray-400 border-b border-white/10 mb-2">
        <div className="flex items-center gap-1.5 text-gray-300 font-medium text-[11px]">
          <KeyboardIcon className="w-3.5 h-3.5 text-blue-400" />
          <span>Interactive On-Screen Keyboard</span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Hide Keyboard"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Rows */}
      <div className="space-y-1.5">
        {currentRows.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {/* Shift key on third row */}
            {rIdx === 2 && (
              <button
                type="button"
                onClick={() => setIsShift(!isShift)}
                className={`flex-1 max-w-[44px] h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                  isShift ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-200 hover:bg-slate-600'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}

            {row.map((char) => (
              <button
                key={char}
                type="button"
                onClick={() => handleKeyClick(char)}
                className="flex-1 max-w-[40px] sm:max-w-[48px] h-10 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-semibold text-sm sm:text-base border border-white/10 shadow-xs transition-all flex items-center justify-center cursor-pointer"
              >
                {isShift ? char.toUpperCase() : char}
              </button>
            ))}

            {/* Backspace key on third row */}
            {rIdx === 2 && (
              <button
                type="button"
                onClick={handleBackspace}
                className="flex-1 max-w-[48px] h-10 rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-95 text-gray-200 transition-all flex items-center justify-center"
              >
                <Delete className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {/* Bottom Control Row */}
        <div className="flex justify-center gap-1 sm:gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => setLayout(layout === 'letters' ? 'numbers' : 'letters')}
            className="w-14 sm:w-16 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-all flex items-center justify-center"
          >
            {layout === 'letters' ? '?123' : 'ABC'}
          </button>

          <button
            type="button"
            onClick={() => handleKeyClick(' ')}
            className="flex-1 max-w-[240px] sm:max-w-[280px] h-10 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-98 text-gray-300 font-medium text-xs border border-white/10 shadow-xs transition-all flex items-center justify-center"
          >
            space
          </button>

          <button
            type="button"
            onClick={handleEnter}
            className="w-16 sm:w-20 h-10 rounded-lg bg-[#002B7F] hover:bg-blue-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-1"
          >
            <span>done</span>
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
