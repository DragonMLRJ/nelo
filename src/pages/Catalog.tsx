                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>


    <AdBanner slot="catalog-top" className="mb-8" />


    {/* Active Filters Summary (Chips) */}
    {activeFiltersCount > 0 && (
      <div className="flex flex-wrap gap-2 mb-6">
        {(priceRange.min || priceRange.max) && (
          <div className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
            Price: {priceRange.min || '0'} - {priceRange.max || '???'} {filterCurrency}
            <button onClick={() => setPriceRange({ min: '', max: '' })}><X className="w-3 h-3 hover:text-red-500" /></button>
          </div>
        )}
        {verifiedSellerOnly && (
          <div className="inline-flex items-center gap-1 bg-teal-100 px-3 py-1 rounded-full text-xs font-medium text-teal-800">
            Verified Sellers <button onClick={() => setVerifiedSellerOnly(false)}><X className="w-3 h-3 hover:text-red-500" /></button>
          </div>
        )}
        {officialStoresOnly && (
          <div className="inline-flex items-center gap-1 bg-purple-100 px-3 py-1 rounded-full text-xs font-medium text-purple-800">
            Official Stores <button onClick={() => setOfficialStoresOnly(false)}><X className="w-3 h-3 hover:text-red-500" /></button>
          </div>
        )}
        {searchParams.get('loc') && (
          <div className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
            <MapPin className="w-3 h-3" /> {searchParams.get('loc')}
            <button onClick={() => setSearchParams(prev => { prev.delete('loc'); return prev; })}><X className="w-3 h-3 hover:text-red-500" /></button>
          </div>
        )}
        {selectedConditions.map(c => (
          <div key={c} className="inline-flex items-center gap-1 bg-teal-100 px-3 py-1 rounded-full text-xs font-medium text-teal-800">
            {c} <button onClick={() => toggleCondition(c)}><X className="w-3 h-3 hover:text-red-500" /></button>
          </div>
        ))}
        <button onClick={clearFilters} className="text-xs text-red-500 hover:underline px-2">Clear all</button>
      </div>
    )}


    {/* Products Grid */}
    {loading ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    ) : processedProducts.length > 0 ? (
      <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {processedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>


        {/* Conditional Ad Injection */}
        {processedProducts.length > 4 && (
          <div className="col-span-2 sm:col-span-3 lg:col-span-4">
            <AdBanner slot="catalog-mid-feed" />
          </div>
        )}
      </motion.div>
    ) : (
      <div className="text-center py-24 bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Search className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No items found</h3>
        <p className="text-gray-500 text-sm mb-6">
          {searchQuery ? `We couldn't find anything matching "${searchQuery}".` : "Try adjusting your filters."}
        </p>
        <button onClick={() => { clearFilters(); clearSearch(); }} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-sm">
          Clear all filters
        </button>
      </div>
    )}
  </div>
    
  </motion.div >
  );
};


export default Catalog;

