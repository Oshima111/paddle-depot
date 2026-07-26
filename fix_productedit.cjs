const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'ProductEditPage.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Find the corrupted section: from the incomplete catch block to the end of file
// The corruption started at line: "    } catch (err: any) {"
// We need to find "    } catch (err: any) {" and keep everything before it

const catchIndex = content.indexOf(`    } catch (err: any) {`);
if (catchIndex === -1) {
  console.log('Could not find catch block');
  process.exit(1);
}

// Keep everything before the catch block (the onSubmit function body up to the bad catch)
const beforeCatch = content.substring(0, catchIndex);

// Find the last occurrence of `    } finally {` before the catch to understand where we are
// The correct code should have catch...finally... then return statement

// The correct replacement - add the proper catch/finally/close, then the JSX return
const correctOnSubmitEnd = `    } catch (err: any) {
      setSaveError(err.message || "An error occurred while saving.");
    } finally {
      setUploadProgress(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? "Edit Product" : "Add Product"}
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEditMode ? "Update paddle details below" : "Fill in the details for the new paddle"}
          </p>
        </div>
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Back to Products
        </Link>
      </div>

      {/* Fetch Error */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {fetchError}
        </div>
      )}

      {/* Save Error */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {saveError}
        </div>
      )}

      {/* Save Success */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg text-sm">
          {saveSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h3>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Paddle Name</label>
            <input
              type="text"
              {...register("name", { required: "Product name is required" })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="e.g. RPM Q2"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand</label>
            <select
              {...register("brand", { required: "Brand is required" })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
            >
              <option value="">Select a brand...</option>
              {AVAILABLE_BRANDS.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand.message}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (₱)</label>
            <input
              type="number"
              {...register("price", { required: "Price is required", min: { value: 1, message: "Price must be greater than 0" } })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="e.g. 13000"
            />
            {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              {...register("description", { required: "Description is required" })}
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"
              placeholder="Describe the paddle..."
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          {/* Stock Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock Status</label>
            <select
              {...register("stockStatus")}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
            >
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Featured & New Toggles */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("featured")}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("is_new")}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">New Arrival</span>
            </label>
          </div>

        {/* Image Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Paddle Image</h3>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={\`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer \${dragOver ? "border-emerald-500 bg-emerald-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"}\`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-40 w-auto object-contain rounded-lg"
                />
                <p className="text-xs text-gray-400">Click or drag to change image</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-gray-500">Drop an image here or click to browse</p>
                <p className="text-xs text-gray-400">JPG, PNG, or WebP up to 5MB</p>
              </div>
            )}
          </div>

          {fileError && <p className="text-xs text-red-500">{fileError}</p>}

          {/* Hidden image path field for Supabase storage URL */}
          <input type="hidden" {...register("image")} />
        </div>

        {/* Product Variants Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Product Variants</h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasOptions}
                onChange={(e) => setHasOptions(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {hasOptions ? "Enabled" : "Disabled"}
              </span>
            </label>
          </div>
          <p className="text-xs text-gray-400">
            Enable this to allow customers to customize the product by selecting from different sizes, colors, or shape combinations. Each variant can have its own image.
          </p>

          {hasOptions && (
            <div className="space-y-6 pt-2 border-t border-gray-100">
              {/* Existing Variants List */}
              {variants.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Existing Variants</label>
                  <div className="space-y-2">
                    {variants.map((variant, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {variant.image && (
                            <img
                              src={variant.image}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-200 flex-shrink-0"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {
