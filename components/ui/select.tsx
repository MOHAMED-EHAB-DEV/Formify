'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useId,
  useCallback,
  useEffect,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { useFloating, type FloatingPlacement } from '@/hooks/use-floating';
import { useOverlay } from '@/hooks/use-overlay';
import { Portal } from '@/components/ui/portal';
import { ChevronDownIcon, CheckIcon, XIcon } from '@/components/ui/svgs/icons';
import { cn } from '@/lib/utils';

// ==========================================
// Types
// ==========================================

export type SelectSize = 'sm' | 'md' | 'lg';
export type SelectVariant = 'flat' | 'bordered' | 'faded';

interface OptionMetadata {
  value: string;
  label: ReactNode;
  textValue: string;
  disabled?: boolean;
}

interface SelectContextValue {
  selectedValue: string;
  focusedValue: string | null;
  setFocusedValue: (val: string | null) => void;
  onSelectOption: (val: string, label: ReactNode) => void;
  size: SelectSize;
  variant: SelectVariant;
  listboxId: string;
  registerOption: (opt: OptionMetadata) => () => void;
}

const SelectContext = createContext<SelectContextValue | null>(null);

function useSelectContext() {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error('Select sub-components must be used within a <Select> root component');
  }
  return ctx;
}

// ==========================================
// SelectItem Component
// ==========================================

export interface SelectItemProps {
  value: string | number;
  children: ReactNode;
  description?: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
  textValue?: string;
}

export function SelectItem({
  value,
  children,
  description,
  startContent,
  endContent,
  disabled = false,
  destructive = false,
  className,
  textValue,
}: SelectItemProps) {
  const {
    selectedValue,
    focusedValue,
    setFocusedValue,
    onSelectOption,
    size,
    listboxId,
    registerOption,
  } = useSelectContext();

  const itemRef = useRef<HTMLDivElement | null>(null);
  const stringValue = String(value);
  const isSelected = selectedValue === stringValue;
  const isFocused = focusedValue === stringValue;
  const itemId = `${listboxId}-opt-${stringValue}`;

  // Extract plain text value for typeahead search
  const plainText =
    textValue ||
    (typeof children === 'string'
      ? children
      : typeof children === 'number'
      ? String(children)
      : stringValue);

  useEffect(() => {
    return registerOption({
      value: stringValue,
      label: children,
      textValue: plainText,
      disabled,
    });
  }, [registerOption, stringValue, children, plainText, disabled]);

  // Scroll active item into view on keyboard focus
  useEffect(() => {
    if (isFocused && itemRef.current) {
      itemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [isFocused]);

  const sizeStyles = {
    sm: 'py-1.5 px-2.5 text-xs rounded-md gap-2',
    md: 'py-2 px-3 text-sm rounded-lg gap-2.5',
    lg: 'py-2.5 px-3.5 text-base rounded-xl gap-3',
  }[size];

  return (
    <div
      ref={itemRef}
      id={itemId}
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      tabIndex={-1}
      data-focused={isFocused ? 'true' : undefined}
      data-selected={isSelected ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className={cn(
        'group relative flex w-full items-center justify-between font-medium select-none cursor-pointer transition-colors duration-150 outline-none text-start',
        sizeStyles,
        isSelected
          ? 'bg-primary/10 text-primary font-semibold hover:bg-primary/15'
          : isFocused
          ? 'bg-muted text-foreground'
          : 'text-foreground hover:bg-muted/70',
        destructive && !isSelected && 'text-destructive hover:bg-destructive/10',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) {
          onSelectOption(stringValue, children);
        }
      }}
      onMouseEnter={() => {
        if (!disabled) {
          setFocusedValue(stringValue);
        }
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {startContent && (
          <span className="shrink-0 text-muted-foreground group-data-[selected=true]:text-primary">
            {startContent}
          </span>
        )}
        <div className="flex min-w-0 flex-col">
          <span className="truncate">{children}</span>
          {description && (
            <span className="text-[11px] font-normal text-muted-foreground truncate">
              {description}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 ms-2">
        {endContent && <span className="text-xs text-muted-foreground">{endContent}</span>}
        {isSelected && (
          <CheckIcon
            size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16}
            className="text-primary shrink-0 animate-fade-in"
          />
        )}
      </div>
    </div>
  );
}

// ==========================================
// SelectSection Component
// ==========================================

export interface SelectSectionProps {
  title?: ReactNode;
  showDivider?: boolean;
  children: ReactNode;
  className?: string;
}

export function SelectSection({
  title,
  showDivider = false,
  children,
  className,
}: SelectSectionProps) {
  return (
    <div role="group" aria-label={typeof title === 'string' ? title : undefined} className={cn('py-1', className)}>
      {showDivider && <div className="my-1 h-px bg-border-subtle" role="separator" />}
      {title && (
        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 select-none">
          {title}
        </div>
      )}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

// ==========================================
// Main Select Component
// ==========================================

export interface SelectOption {
  value: string | number;
  label: ReactNode;
  description?: ReactNode;
  startContent?: ReactNode;
  endContent?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface SelectProps {
  id?: string;
  name?: string;
  label?: ReactNode;
  labelPlacement?: 'outside' | 'inside';
  placeholder?: string;
  description?: ReactNode;
  errorMessage?: ReactNode;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  size?: SelectSize;
  variant?: SelectVariant;
  value?: string | number;
  defaultValue?: string | number;
  onValueChange?: (value: string) => void;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  startContent?: ReactNode;
  endContent?: ReactNode;
  selectorIcon?: ReactNode;
  isClearable?: boolean;
  placement?: FloatingPlacement;
  matchTriggerWidth?: boolean;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  'aria-label'?: string;
  children?: ReactNode;
  options?: SelectOption[];
}

export function Select({
  id: customId,
  name,
  label,
  labelPlacement = 'outside',
  placeholder = 'Select an option...',
  description,
  errorMessage,
  isInvalid = false,
  isRequired = false,
  isDisabled = false,
  size = 'md',
  variant = 'bordered',
  value: controlledValue,
  defaultValue,
  onValueChange,
  onChange,
  startContent,
  endContent,
  selectorIcon,
  isClearable = false,
  placement = 'bottom-start',
  matchTriggerWidth = true,
  className,
  triggerClassName,
  popoverClassName,
  'aria-label': ariaLabel,
  children,
  options,
}: SelectProps) {
  const autoId = useId();
  const selectId = customId || autoId;
  const listboxId = `${selectId}-listbox`;
  const labelId = `${selectId}-label`;
  const descriptionId = `${selectId}-description`;
  const errorId = `${selectId}-error`;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue !== undefined ? String(defaultValue) : ''
  );
  const selectedValue = isControlled ? String(controlledValue ?? '') : internalValue;

  const [isOpen, setIsOpen] = useState(false);
  const [focusedValue, setFocusedValue] = useState<string | null>(null);

  // Store registered options metadata
  const optionsMapRef = useRef<Map<string, OptionMetadata>>(new Map());
  const optionsListRef = useRef<OptionMetadata[]>([]);
  const [, setRegisterTick] = useState(0);

  const registerOption = useCallback((opt: OptionMetadata) => {
    optionsMapRef.current.set(opt.value, opt);
    optionsListRef.current = Array.from(optionsMapRef.current.values());
    setRegisterTick((t) => t + 1);

    return () => {
      optionsMapRef.current.delete(opt.value);
      optionsListRef.current = Array.from(optionsMapRef.current.values());
      setRegisterTick((t) => t + 1);
    };
  }, []);

  const { triggerRef, setFloatingRef } = useFloating<HTMLButtonElement, HTMLDivElement>({
    placement,
    isOpen,
    offset: 4,
    matchTriggerWidth,
  });

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setFocusedValue(null);
  }, []);

  const { overlayRef } = useOverlay({
    isOpen,
    onClose: closeMenu,
    lockScroll: false,
    closeOnClickOutside: true,
    closeOnEscape: true,
    ignoreElements: [triggerRef.current],
  });

  const handleSelectOption = useCallback(
    (newVal: string) => {
      if (!isControlled) {
        setInternalValue(newVal);
      }
      onValueChange?.(newVal);
      onChange?.({
        target: {
          value: newVal,
          name,
        },
      });
      closeMenu();
      triggerRef.current?.focus();
    },
    [isControlled, onValueChange, onChange, name, closeMenu, triggerRef]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      handleSelectOption('');
    },
    [handleSelectOption]
  );

  // Keyboard navigation & Typeahead
  const typeaheadQueryRef = useRef('');
  const typeaheadTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getEnabledOptions = useCallback(() => {
    return optionsListRef.current.filter((o) => !o.disabled);
  }, []);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (isDisabled) return;

    const enabledOptions = getEnabledOptions();
    if (enabledOptions.length === 0) return;

    const currentIndex = enabledOptions.findIndex((o) => o.value === (focusedValue || selectedValue));

    switch (e.key) {
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (isOpen) {
          if (focusedValue) {
            handleSelectOption(focusedValue);
          } else if (selectedValue) {
            handleSelectOption(selectedValue);
          }
        } else {
          setIsOpen(true);
          const initialFocus = selectedValue || enabledOptions[0]?.value || null;
          setFocusedValue(initialFocus);
        }
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          const nextVal = selectedValue || enabledOptions[0]?.value || null;
          setFocusedValue(nextVal);
        } else {
          const nextIndex = currentIndex < enabledOptions.length - 1 ? currentIndex + 1 : 0;
          setFocusedValue(enabledOptions[nextIndex].value);
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          const prevVal =
            selectedValue || enabledOptions[enabledOptions.length - 1]?.value || null;
          setFocusedValue(prevVal);
        } else {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : enabledOptions.length - 1;
          setFocusedValue(enabledOptions[prevIndex].value);
        }
        break;
      }
      case 'Home': {
        if (isOpen) {
          e.preventDefault();
          setFocusedValue(enabledOptions[0].value);
        }
        break;
      }
      case 'End': {
        if (isOpen) {
          e.preventDefault();
          setFocusedValue(enabledOptions[enabledOptions.length - 1].value);
        }
        break;
      }
      case 'Escape': {
        if (isOpen) {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
        }
        break;
      }
      case 'Tab': {
        if (isOpen) {
          closeMenu();
        }
        break;
      }
      default: {
        // Typeahead navigation
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          if (!isOpen) setIsOpen(true);

          if (typeaheadTimerRef.current) {
            clearTimeout(typeaheadTimerRef.current);
          }

          typeaheadQueryRef.current += e.key.toLowerCase();
          const query = typeaheadQueryRef.current;

          const match = enabledOptions.find((opt) =>
            opt.textValue.toLowerCase().startsWith(query)
          );

          if (match) {
            setFocusedValue(match.value);
          }

          typeaheadTimerRef.current = setTimeout(() => {
            typeaheadQueryRef.current = '';
          }, 500);
        }
      }
    }
  };

  // Determine current selected label to display in trigger
  const currentOption = optionsMapRef.current.get(selectedValue);
  const selectedLabel = currentOption ? currentOption.label : selectedValue;

  // Size styling for trigger
  const sizeConfig = {
    sm: {
      height: 'h-8',
      text: 'text-xs',
      padding: 'px-2.5 py-1',
      radius: 'rounded-md',
      iconSize: 14,
    },
    md: {
      height: 'h-10',
      text: 'text-sm',
      padding: 'px-3 py-2',
      radius: 'rounded-lg',
      iconSize: 16,
    },
    lg: {
      height: 'h-12',
      text: 'text-base',
      padding: 'px-4 py-2.5',
      radius: 'rounded-xl',
      iconSize: 18,
    },
  }[size];

  // Variant styling
  const variantStyles = {
    bordered:
      'border border-input bg-card shadow-xs hover:border-foreground/30 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20',
    flat: 'border border-transparent bg-muted/60 hover:bg-muted focus-visible:bg-card focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20',
    faded:
      'border border-input/60 bg-muted/30 hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20',
  }[variant];

  // Render options if data-driven options array passed
  const renderedContent = options
    ? options.map((opt) => (
        <SelectItem
          key={opt.value}
          value={opt.value}
          description={opt.description}
          startContent={opt.startContent}
          endContent={opt.endContent}
          disabled={opt.disabled}
          destructive={opt.destructive}
        >
          {opt.label}
        </SelectItem>
      ))
    : children;

  const contextValue: SelectContextValue = {
    selectedValue,
    focusedValue,
    setFocusedValue,
    onSelectOption: handleSelectOption,
    size,
    variant,
    listboxId,
    registerOption,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      <div className={cn('relative flex w-full flex-col gap-1.5', className)}>
        {/* Outside Label */}
        {label && labelPlacement === 'outside' && (
          <label
            id={labelId}
            htmlFor={selectId}
            className="text-xs font-semibold text-foreground/80 select-none flex items-center gap-1"
          >
            <span>{label}</span>
            {isRequired && <span className="text-destructive font-bold" aria-hidden="true">*</span>}
          </label>
        )}

        {/* Combobox Trigger */}
        <button
          ref={triggerRef}
          id={selectId}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? listboxId : undefined}
          aria-labelledby={label ? labelId : undefined}
          aria-label={ariaLabel || (typeof placeholder === 'string' ? placeholder : undefined)}
          aria-required={isRequired}
          aria-invalid={isInvalid ? 'true' : undefined}
          aria-disabled={isDisabled}
          aria-describedby={
            errorMessage ? errorId : description ? descriptionId : undefined
          }
          aria-activedescendant={
            isOpen && focusedValue ? `${listboxId}-opt-${focusedValue}` : undefined
          }
          disabled={isDisabled}
          tabIndex={isDisabled ? -1 : 0}
          onClick={() => {
            if (!isDisabled) {
              setIsOpen(!isOpen);
              if (!isOpen) {
                setFocusedValue(selectedValue || getEnabledOptions()[0]?.value || null);
              }
            }
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            'group relative flex w-full items-center justify-between gap-2 font-medium text-start transition-all duration-150 outline-none select-none cursor-pointer',
            sizeConfig.height,
            sizeConfig.text,
            sizeConfig.padding,
            sizeConfig.radius,
            variantStyles,
            isInvalid && 'border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20',
            isDisabled && 'cursor-not-allowed opacity-50 hover:border-input pointer-events-none',
            triggerClassName
          )}
        >
          {/* Start Content / Prefix Icon */}
          {startContent && (
            <span className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground">
              {startContent}
            </span>
          )}

          {/* Trigger Inner Text / Inside Label */}
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            {label && labelPlacement === 'inside' && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
                {label}
                {isRequired && <span className="ms-0.5 text-destructive">*</span>}
              </span>
            )}
            <span
              className={cn(
                'truncate',
                selectedValue ? 'text-foreground' : 'text-muted-foreground font-normal'
              )}
            >
              {selectedValue ? selectedLabel : placeholder}
            </span>
          </div>

          {/* End Adornment / Icons */}
          <div className="flex items-center gap-1.5 shrink-0 ms-1 text-muted-foreground">
            {endContent}

            {/* Clear Button */}
            {isClearable && selectedValue && !isDisabled && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear selection"
                onClick={handleClear}
                className="rounded-full p-0.5 hover:bg-muted hover:text-foreground transition-colors"
              >
                <XIcon size={14} />
              </span>
            )}

            {/* Selector Icon with 180° smooth flip */}
            {selectorIcon ? (
              selectorIcon
            ) : (
              <ChevronDownIcon
                size={sizeConfig.iconSize}
                className={cn(
                  'transition-transform duration-200 shrink-0 text-muted-foreground group-hover:text-foreground',
                  isOpen && 'rotate-180'
                )}
              />
            )}
          </div>
        </button>

        {/* Hidden native select for standard HTML form serialization & FormData */}
        {name && (
          <select
            name={name}
            value={selectedValue}
            aria-hidden="true"
            tabIndex={-1}
            required={isRequired}
            disabled={isDisabled}
            onChange={() => {}}
            className="sr-only pointer-events-none"
          >
            <option value="" disabled={isRequired}>
              {placeholder}
            </option>
            {optionsListRef.current.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.textValue}
              </option>
            ))}
          </select>
        )}

        {/* Description or Error Message */}
        {errorMessage ? (
          <p id={errorId} role="alert" className="text-xs font-medium text-destructive animate-fade-in">
            {errorMessage}
          </p>
        ) : description ? (
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description}
          </p>
        ) : null}

        {/* Floating Popover Listbox */}
        {isOpen && (
          <Portal>
            <div
              ref={(node) => {
                setFloatingRef(node);
                overlayRef.current = node;
              }}
              id={listboxId}
              role="listbox"
              aria-labelledby={selectId}
              aria-orientation="vertical"
              tabIndex={-1}
              className={cn(
                'z-50 max-h-64 overflow-y-auto rounded-xl border border-border bg-card/95 backdrop-blur-md p-1 text-card-foreground shadow-xl animate-fade-in focus:outline-none will-change-transform scrollbar-thin',
                popoverClassName
              )}
            >
              {renderedContent}
            </div>
          </Portal>
        )}
      </div>
    </SelectContext.Provider>
  );
}
