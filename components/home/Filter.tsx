import { Badge } from "@/components/ui/badge";
import { Button as UiButton } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Check, ListFilter } from "lucide-react";
import React from "react";

interface FilterProps {
  values: string;
  title: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export default function Filter({ values, title, options, onChange }: FilterProps) {
  // Limpia los valores para que cmdk no falle
  const safeOptions = options.map((opt) => ({
    ...opt,
    value: opt.value.replace(/\s+/g, " ").trim(),
  }));

  const [selectedValues, setSelectedValues] = React.useState(
    new Set(values.split(",").map((v) => v.replace(/\s+/g, " ").trim()))
  );

  React.useEffect(() => {
    if (values.length === 0) {
      setSelectedValues(new Set());
    }
  }, [values]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <UiButton variant="outline" size="sm" className="h-8 border-dashed px-1 truncate">
          <ListFilter className="mr-1 h-4 w-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge variant="secondary" className="rounded-sm px-1 font-normal lg:hidden">
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  safeOptions
                    .filter((option) => selectedValues.has(option.value))
                    .map((option, index) => (
                      <Badge
                        variant="secondary"
                        key={`${option.value}-${index}`} // ✅ combinamos value + index para que sea único
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </UiButton>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {safeOptions.map((option, index) => {
                const isSelected = selectedValues.has(option.value);
                
                // Valor seguro para cmdk
                const cmdkValue = option.value.replace(/\s+/g, "-").toLowerCase();

                return (
                  <CommandItem
                    key={`${option.value}-${index}`} // clave única
                    value={option.value.replace(/\s+/g, "-").toLowerCase()} // ✅ valor seguro para cmdk
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value);
                      } else {
                        selectedValues.add(option.value);
                      }
                      const filterValues = Array.from(selectedValues);
                      onChange(filterValues.join(","));
                      setSelectedValues(new Set(selectedValues)); // forzar re-render
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}

            </CommandGroup>

            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSelectedValues(new Set());
                      onChange("");
                    }}
                    className="justify-center text-center"
                  >
                    Limpiar
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
