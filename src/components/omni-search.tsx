
"use client";

import type { Product, ProductSearchResult } from '@/types/product';
import { AlertTriangle, ChevronLeft, ChevronRight, Loader2, Search as SearchIcon } from 'lucide-react';
import Image from 'next/image';
import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const DEBOUNCE_DELAY = 500;
const MIN_SEARCH_LENGTH = 2;
const PRODUCTS_PER_PAGE = 5; // Reduced for better UI in dropdown

export default function OmniSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const fetchSuggestions = useCallback(async (query: string, page: number) => {
    if (query.length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      setIsDropdownVisible(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const skip = (page - 1) * PRODUCTS_PER_PAGE;
      const response = await fetch(
        `https://dummyjson.com/products/search?q=${encodeURIComponent(query)}&limit=${PRODUCTS_PER_PAGE}&skip=${skip}`
      );
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const data = (await response.json()) as ProductSearchResult;
      setSuggestions(data.products);
      setTotalProducts(data.total);
      setIsDropdownVisible(data.products.length > 0);
      if (data.products.length === 0 && data.total > 0 && page > 1) {
        // If current page is empty but there are products, go to last valid page
        setCurrentPage(Math.ceil(data.total / PRODUCTS_PER_PAGE));
      } else if (data.products.length === 0 && data.total === 0) {
         setError("No products found for your query.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      setSuggestions([]);
      setIsDropdownVisible(false);
      toast({
        variant: "destructive",
        title: "Search Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= MIN_SEARCH_LENGTH) {
        setCurrentPage(1); // Reset to first page on new search term
        fetchSuggestions(searchTerm, 1);
      } else {
        setSuggestions([]);
        setIsDropdownVisible(false);
        setError(null);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchSuggestions]);

  useEffect(() => {
    if (searchTerm.length >= MIN_SEARCH_LENGTH && currentPage > 0) {
        fetchSuggestions(searchTerm, currentPage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // searchTerm is excluded as it's handled by the debounced effect


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleInputFocus = () => {
    if (searchTerm.length >= MIN_SEARCH_LENGTH && suggestions.length > 0) {
        setIsDropdownVisible(true);
    }
  }

  const handleSuggestionClick = (product: Product) => {
    setSearchTerm(product.title); // Or navigate to product page, etc.
    setIsDropdownVisible(false);
    // Potentially fetch full product details or navigate
    toast({
        title: "Selected Product",
        description: `${product.title} selected. Price: $${product.price}`
    })
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search for products..."
          className="w-full pl-10 pr-10 py-3 text-lg rounded-full shadow-lg focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2"
          aria-label="Search products"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary animate-spin" />
        )}
      </div>

      {isLoading && searchTerm.length >= MIN_SEARCH_LENGTH && (
         <div className="w-full pt-2 px-1"> {/* Added pt-2 for a little space, px-1 to align with input's visual width */}
           <Progress value={50} className="h-1 w-full rounded-full" />
         </div>
      )}

      {isDropdownVisible && (
        <Card 
            ref={dropdownRef} 
            className={cn(
              "absolute z-10 mt-2 w-full rounded-lg border bg-popover shadow-xl overflow-hidden",
              "animate-in fade-in-0 zoom-in-95" 
            )}
            data-state={isDropdownVisible ? "open" : "closed"}
        >
          <CardContent className="p-0">
            {/* This loader shows if suggestions are empty AND we are loading. The input loader is more general. */}
            {isLoading && suggestions.length === 0 && searchTerm.length >= MIN_SEARCH_LENGTH && (
              <div className="p-6 flex items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                <span>Loading suggestions...</span>
              </div>
            )}

            {!isLoading && error && suggestions.length === 0 && searchTerm.length >= MIN_SEARCH_LENGTH && (
              <Alert variant="destructive" className="m-2 rounded-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {suggestions.length > 0 && (
              <ul className="max-h-[calc(5*4rem+2.5rem)] overflow-y-auto divide-y divide-border"> {/* max 5 items + pagination */}
                {suggestions.map((product) => (
                  <li key={product.id}>
                    <Button
                      variant="ghost"
                      className="w-full h-auto justify-start p-3 rounded-none text-left hover:bg-accent/20" // Adjusted hover to be less intense with new accent
                      onClick={() => handleSuggestionClick(product)}
                    >
                      <Image
                        src={product.thumbnail || `https://placehold.co/40x40.png`}
                        alt={product.title}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded-md mr-3"
                        data-ai-hint="product thumbnail"
                      />
                      <div className="flex-grow">
                        <p className="font-medium text-sm text-foreground truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                      </div>
                      <p className="text-sm font-semibold text-primary ml-auto">${product.price.toFixed(2)}</p>
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            {totalProducts > PRODUCTS_PER_PAGE && suggestions.length > 0 && (
              <div className="p-2 flex justify-between items-center border-t border-border bg-background/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || isLoading}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
