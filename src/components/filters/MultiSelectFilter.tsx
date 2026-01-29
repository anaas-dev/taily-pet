import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Option {
  value: string;
  label: string;
  icon?: LucideIcon;
}

interface MultiSelectFilterProps {
  label: string;
  placeholder: string;
  options: Option[];
  selected: string[];
  onSelectionChange: (selected: string[]) => void;
  className?: string;
}

const MultiSelectFilter = ({
  label,
  placeholder,
  options,
  selected,
  onSelectionChange,
  className,
}: MultiSelectFilterProps) => {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onSelectionChange(selected.filter((v) => v !== value));
    } else {
      onSelectionChange([...selected, value]);
    }
  };

  const getDisplayText = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      return options.find((o) => o.value === selected[0])?.label || placeholder;
    }
    return `${selected.length} selected`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-white/80">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className={cn(
              "w-full justify-between bg-background text-left font-normal",
              selected.length === 0 && "text-muted-foreground"
            )}
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[200px] p-2 bg-background z-50" align="start">
          <div className="flex flex-col gap-1 max-h-60 overflow-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => toggleOption(option.value)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-primary/10 text-primary"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border border-primary",
                      isSelected ? "bg-primary text-primary-foreground" : "opacity-50"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                  {Icon && <Icon className="h-4 w-4" />}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MultiSelectFilter;
