
"use client";

import type { Product, ProductSearchResult } from '@/types/product';
import { AlertTriangle, ChevronLeft, ChevronRight, Search as SearchIcon } from 'lucide-react'; // Removed Loader2
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
const PRODUCTS_PER_PAGE = 5;

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

  const [progress, setProgress] = useState(0);
  const [showProgressBar, setShowProgressBar] = useState(false);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  const fetchSuggestions = useCallback(async (query: string, page: number) => {
    if (query.length < MIN_SEARCH_LENGTH) {
      setSuggestions([]);
      setIsDropdownVisible(false);
      setError(null); // Clear error when query is too short
      setIsLoading(false); // Ensure loading is false
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
        setCurrentPage(1); 
        fetchSuggestions(searchTerm, 1);
      } else {
        setSuggestions([]);
        setIsDropdownVisible(false);
        setError(null);
        setIsLoading(false); // Explicitly set isLoading to false
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, fetchSuggestions]);

  useEffect(() => {
    if (searchTerm.length >= MIN_SEARCH_LENGTH && currentPage > 0 && !isLoading) { // Fetch only if not already loading due to searchterm change
      // Check if the debounced fetch for searchTerm would have already triggered this.
      // This effect is mainly for page changes.
      const newSkip = (currentPage - 1) * PRODUCTS_PER_PAGE;
      const currentSkipGuessForSearchTerm = 0; // Debounced effect resets page to 1
      if (newSkip !== currentSkipGuessForSearchTerm || suggestions.length > 0) { // Avoid re-fetching if searchTerm just changed
         fetchSuggestions(searchTerm, currentPage);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);


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

  // Effect for managing progress bar animation
  useEffect(() => {
    let hideTimeout: NodeJS.Timeout | undefined;
    let animateToNinetyTimeout: NodeJS.Timeout | undefined;

    if (isLoading && searchTerm.length >= MIN_SEARCH_LENGTH) {
      setShowProgressBar(true);
      setProgress(10); // Start animation from 10%
      animateToNinetyTimeout = setTimeout(() => {
        setProgress(90); // Animate towards 90%
      }, 50); // Short delay for CSS transition to pick up from 10%
    } else if (!isLoading && showProgressBar) {
      // Loading finished and progress bar was visible
      setProgress(100); // Animate to 100%
      hideTimeout = setTimeout(() => {
        setShowProgressBar(false);
        // setProgress(0); // Reset implicitly by the next condition or when loading starts
      }, 600); // Wait for animation (500ms) + buffer (100ms)
    } else if (!isLoading && !showProgressBar && progress !== 0) {
      // If not loading and not showing, ensure progress is reset
      setProgress(0);
    }
  
    return () => {
      if (animateToNinetyTimeout) clearTimeout(animateToNinetyTimeout);
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [isLoading, searchTerm, showProgressBar, progress]);


  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  
  const handleInputFocus = () => {
    if (searchTerm.length >= MIN_SEARCH_LENGTH && suggestions.length > 0 && !error) {
        setIsDropdownVisible(true);
    }
  }

  const handleSuggestionClick = (product: Product) => {
    setSearchTerm(product.title); 
    setIsDropdownVisible(false);
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
          className="w-full pl-10 pr-4 py-3 text-lg rounded-full shadow-lg focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2" // pr-4 since no spinner
          aria-label="Search products"
        />
        {/* Spinner removed from here */}
      </div>

      {showProgressBar && searchTerm.length >= MIN_SEARCH_LENGTH && (
         <div className="w-full pt-2 px-1">
           <Progress value={progress} className="h-1 w-full rounded-full" />
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
                {/* <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" /> // This Loader2 can also be removed if only progress bar is desired */}
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
                      className="w-full h-auto justify-start p-3 rounded-none text-left hover:bg-accent/20"
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

            {totalProducts > PRODUCTS_PER_PAGE && suggestions.length > 0 && !isLoading && ( // Added !isLoading to hide pagination during load
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
