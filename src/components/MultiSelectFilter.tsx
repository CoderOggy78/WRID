import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  count?: number;
}

interface MultiSelectFilterProps {
  label: string;
  allLabel: string;
  allCount: number;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  label,
  allLabel,
  allCount,
  options,
  selected,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const closePanel = () => {
    setOpen(false);
    setQuery('');
  };

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) closePanel();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const visibleOptions = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter((o) => o.value.toLowerCase().includes(q));
  }, [options, query]);

  const toggleValue = (value: string) => {
    onChange(
      selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]
    );
  };

  const selectableValues = visibleOptions.map((o) => o.value);
  const allVisibleSelected =
    selectableValues.length > 0 && selectableValues.every((v) => selected.includes(v));

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-[11px] font-semibold text-ink-muted mb-1">
        {label}
      </label>

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? closePanel() : setOpen(true))}
        className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs text-left outline-none transition-all cursor-pointer ${
          selected.length > 0
            ? 'bg-teal-50 border-teal-300 text-teal-900 hover:bg-teal-50/80'
            : 'bg-[#FAF8F5] border-stone-line text-ink-primary hover:bg-stone-hover'
        }`}
      >
        <span className="truncate">
          {selected.length === 0 ? (
            <span className="text-ink-secondary">
              {allLabel} ({allCount.toLocaleString()})
            </span>
          ) : (
            <span className="font-medium">
              {selected.length} selected
            </span>
          )}
        </span>
        <span className="w-12 shrink-0 flex items-center justify-end gap-1 pointer-events-none">
          {selected.length > 0 && <X className="w-3.5 h-3.5 text-teal-700" />}
          <ChevronDown
            className={`w-3.5 h-3.5 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {selected.length > 0 && (
        <button
          type="button"
          aria-label={`Clear ${label.toLowerCase()}`}
          onClick={(e) => {
            e.stopPropagation();
            onChange([]);
          }}
          className="absolute right-7 top-[1.55rem] text-ink-muted hover:text-teal-800 transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {open && (
        <div className="absolute z-40 left-0 right-0 top-full mt-1 bg-white border border-stone-line rounded-lg shadow-float p-2 space-y-2 animate-fade-in">
          {options.length > 8 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full pl-8 pr-2 py-1.5 rounded-md border border-stone-line bg-[#FAF8F5] focus:bg-white focus:border-teal-600 outline-none text-xs text-ink-primary transition-all"
              />
            </div>
          )}

          <div className="flex items-center justify-between px-1 text-[11px] text-ink-muted">
            <button
              type="button"
              onClick={() => onChange(allVisibleSelected ? selected.filter((v) => !selectableValues.includes(v)) : Array.from(new Set([...selected, ...selectableValues])))}
              className="text-teal-700 hover:text-teal-900 font-medium cursor-pointer"
            >
              {allVisibleSelected ? 'Deselect shown' : 'Select shown'}
            </button>
            <button
              type="button"
              onClick={() => onChange([])}
              disabled={selected.length === 0}
              className="hover:text-ink-primary font-medium disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              Clear
            </button>
          </div>

          <ul
            role="listbox"
            aria-multiselectable="true"
            className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5"
          >
            {visibleOptions.length === 0 && (
              <li className="px-2 py-3 text-center text-[11px] text-ink-muted">
                No {label.toLowerCase()} match "{query}"
              </li>
            )}
            {visibleOptions.map((option) => {
              const isSelected = selected.includes(option.value);
              const isEmpty = option.count === 0 && !isSelected;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => toggleValue(option.value)}
                    title={isEmpty ? `No results for ${option.value} with the current filters` : undefined}
                    className={`w-full flex items-center gap-2 px-1.5 py-1.5 rounded-md text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 font-medium'
                        : isEmpty
                          ? 'text-ink-faint hover:bg-stone-hover/60'
                          : 'text-ink-secondary hover:bg-stone-hover'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-teal-700 border-teal-700' : 'bg-white border-stone-border'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span className={`flex-1 truncate ${isEmpty ? 'line-through decoration-stone-border' : ''}`}>
                      {option.value}
                    </span>
                    {typeof option.count === 'number' && (
                      <span className="text-[10px] font-mono text-ink-muted">
                        {option.count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
