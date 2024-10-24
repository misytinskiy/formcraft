"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { useCommandDialogStore } from "@/store/store";
import { FormWithRelations } from "@/types";

import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

export default function SearchInput({ forms }: { forms: FormWithRelations[] }) {
  const router = useRouter();
  const { close, open, isOpen } = useCommandDialogStore();
  const [query, setQuery] = useState("");
  const [filteredForms, setFilteredForms] = useState(forms);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        open();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  const runCommand = useCallback(
    (command: () => unknown) => {
      close();
      command();
    },
    [close]
  );

  useEffect(() => {
    const filtered = forms.filter((form) =>
      form.title.toLowerCase().includes(query.trim().toLowerCase())
    );
    setFilteredForms(filtered);
  }, [query, forms]);

  return (
    <>
      <div
        onClick={open}
        className="hidden md:flex flex-1 items-center justify-between w-full lg:w-auto max-w-xl lg:min-w-[270px] py-3 px-4 gap-x-6 rounded-md cursor-pointer bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-x-3">
          <SearchIcon className="w-6 h-6 text-neutral-500" />
          <p className="text-neutral-500 font-light">Search</p>
        </div>
      </div>
      <CommandDialog open={isOpen} onOpenChange={close}>
        <CommandInput
          placeholder="Search all the forms"
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          <CommandEmpty>No results found</CommandEmpty>
          <CommandGroup>
            {filteredForms.length > 0 ? (
              filteredForms.map((form) => (
                <CommandItem
                  key={form.id}
                  value={form.id}
                  onSelect={() =>
                    runCommand(() => router.push(`/dashboard/forms/${form.id}`))
                  }
                >
                  {form.title}
                </CommandItem>
              ))
            ) : (
              <CommandEmpty>No forms match your query</CommandEmpty>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
