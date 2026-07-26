import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase, isSupabaseConfigured, uploadProductImage } from "./lib/supabase";
import { products as localProducts } from "./data/products";
import { logAdminActivity } from "./lib/activity";
import type { ProductVariant } from "./data/products";

type FormData = {
  name: string;
  brand: string;
  price: number;
  description: string;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  featured: boolean;
  is_new: boolean;
  image: string;
};

const AVAILABLE_BRANDS = [
  "RPM", "CRBN", "JOOLA", "Honolulu", "Franklin", "Kamito",
  "Selkirk", "Bread and Butter", "Gearbox", "Sypik", "Luzz", "Friday",
];

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;
const AVAILABLE_SHAPES = ["Elongated", "Hybrid", "Widebody"];

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>();
  const isEditMode = Boolean(id);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedFileRef = useRef<File | null>(null);
  const originalProductRef = useRef<any>(null);
  const [hasOptions, setHasOptions] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [newVariant, setNewVariant] = useState<ProductVariant>({ size: "", color: "", shape: "", image: "", stock_status: "In Stock" });
  const [editingVariantIndex, setEditingVariantIndex] = useState<number | null>(null);
  const variantFileInputRef = useRef<HTMLInputElement>(null);
  const variantImageRef = useRef<File | null>(null);

  const isDuplicateVariant = (v: ProductVariant, excludeIndex?: number): boolean => {
    return variants.some((existing, i) =>
      i !== excludeIndex &&
      existing.size === v.size &&
      existing.color === v.color &&
      existing.shape === v.shape
    );
  };

  const addVariant = () => {
    if (!newVariant.size && !newVariant.color && !newVariant.shape) return;
    if (isDuplicateVariant(newVariant)) {
      setSaveError("A variant with this size, color, and shape already exists.");
      return;
    }
setVariants((prev) => [...prev, { ...newVariant, id: undefined }]);
    setNewVariant({ size: "", color: "", shape: "", image: "", stock_status: "In Stock" });
    variantImageRef.current = null;
    setSaveError(null);
  };

  const startEditVariant = (index: number) => {
    setEditingVariantIndex(index);
    setNewVariant({ ...variants[index] });
  };

  const cancelEditVariant = () => {
setEditingVariantIndex(null);
    setNewVariant({ size: "", color: "", shape: "", image: "", stock_status: "In Stock" });
    variantImageRef.current = null;
  };

  const saveEditedVariant = () => {
    if (editingVariantIndex === null) return;
    if (isDuplicateVariant(newVariant, editingVariantIndex)) {
      setSaveError("A variant with this size, color, and shape already exists.");
      return;
    }
    setVariants((prev) => {
      const updated = [...prev];
      updated[editingVariantIndex] = { ...newVariant, id: updated[editingVariantIndex].id };
      return updated;
    });
    setEditingVariantIndex(null);
    setNewVariant({ size: "", color: "", shape: "", image: "", stock_status: "In Stock" });
    variantImageRef.current = null;
    setSaveError(null);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantFileChange = () => {
    const file = variantFileInputRef.current?.files?.[0] ?? null;
    if (!file) return;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) { setSaveError("Invalid file type for variant image. Allowed: JPG, PNG, WebP."); return; }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { setSaveError(`Variant image too large. Maximum is ${MAX_FILE_SIZE_MB} MB.`); return; }
    variantImageRef.current = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewVariant((prev) => ({ ...prev, image: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isEditMode) {
      if (!isSupabaseConfigured) {
        const product = localProducts.find((p) => p.id === Number(id));
        if (!product) { setFetchError("Product not found."); navigate("/admin/products"); return; }
        originalProductRef.current = product;
        resetForm(product);
        return;
      }

      const fetchProduct = async () => {
        const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
        if (error || !data) {
          console.error("Error fetching product:", error);
          setFetchError("Failed to fetch product.");
          navigate("/admin/products");
        } else {
          originalProductRef.current = data;
          const product = data as any;
          const { data: variantData } = await supabase
            .from("product_variants")
            .select("*")
            .eq("product_id", id)
            .order("id");
          resetForm(Object.assign(product, {
            name: product.name || "", brand: product.brand || "", price: product.price || 0,
            description: product.description || "",
            stockStatus: product.stock_status || product.stockStatus || "In Stock",
            featured: product.featured || false, is_new: product.is_new || false, image: product.image || "",
            has_options: product.has_options || false,
            variants: variantData || [],
          }));
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, navigate, reset]);

  const resetForm = (product: any) => {
    const imageVal = product.image || "";
    reset({
      name: product.name || "", brand: product.brand || "", price: product.price || 0,
      description: product.description || "",
      stockStatus: product.stockStatus || product.stock_status || "In Stock",
      featured: product.featured || false, is_new: product.is_new || false, image: imageVal,
    });
    setImagePreview(imageVal || null);
    setHasOptions(product.has_options || false);
    setVariants(product.variants || []);
    setNewVariant({ size: "", color: "", shape: "", image: "", stock_status: "In Stock" });
    setEditingVariantIndex(null);
    variantImageRef.current = null;
  };

  const validateAndSetFile = useCallback((file: File | null) => {
    setFileError(null);
    if (!file) return;
    if (!ALLOWED_FILE_TYPES.includes(file.type)) { setFileError("Invalid file type. Allowed: JPG, JPEG, PNG, WebP."); return; }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) { setFileError(`File too large. Maximum is ${MAX_FILE_SIZE_MB} MB.`); return; }
    selectedFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = () => { const file = fileInputRef.current?.files?.[0] ?? null; validateAndSetFile(file); };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files?.[0] ?? null; validateAndSetFile(file);
  }, [validateAndSetFile]);

  const onSubmit = async (formData: FormData) => {
    setSaveError(null);
    setSaveSuccess(null);
    setUploadProgress(true);

    try {
      let finalImageUrl = formData.image;
      if (selectedFileRef.current) {
        const oldImageUrl = originalProductRef.current?.image || null;
        finalImageUrl = await uploadProductImage(selectedFileRef.current, oldImageUrl);
      }

      const productPayload = {
        name: formData.name,
        brand: formData.brand,
        price: formData.price,
        description: formData.description,
        stock_status: formData.stockStatus,
        featured: formData.featured,
        is_new: formData.is_new,
        image: finalImageUrl,
        has_options: hasOptions,
        updated_at: new Date().toISOString(),
      };

      if (!isSupabaseConfigured) {
        setSaveSuccess("Product saved (local mode)");
        setUploadProgress(false);
        return;
      }

      let result;
      let savedProductId: number;

      if (isEditMode) {
        result = await supabase
          .from("products")
          .update(productPayload)
          .eq("id", id)
          .select()
          .single();

        if (result.error) {
          setSaveError(`Failed to save product: ${result.error.message}`);
          setUploadProgress(false);
          return;
        }

        savedProductId = Number(id);

        await logAdminActivity({
          action: "product_updated",
          description: `Updated ${formData.name}`,
          product_id: savedProductId,
          product_name: formData.name,
        });
      } else {
        result = await supabase
          .from("products")
          .insert({ ...productPayload, created_at: new Date().toISOString() })
          .select()
          .single();

        if (result.error) {
          setSaveError(`Failed to create product: ${result.error.message}`);
          setUploadProgress(false);
          return;
        }

        savedProductId = (result.data as any)?.id;

        await logAdminActivity({
          action: "product_created",
          description: `Created ${formData.name}`,
          product_id: savedProductId,
          product_name: formData.name,
        });
      }

      if (hasOptions && variants.length > 0) {
        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", savedProductId);

const variantRows = variants.map((v) => ({
          product_id: savedProductId,
          size: v.size || "",
          color: v.color || "",
          shape: v.shape || "",
          image: v.image || "",
          stock_status: v.stock_status || "In Stock",
        }));

        const { error: variantError } = await supabase
          .from("product_variants")
          .insert(variantRows);

        if (variantError) {
          console.error("Error saving variants:", variantError);
          setSaveError(`Product saved but failed to save variants: ${variantError.message}`);
          setUploadProgress(false);
          return;
        }
      } else if (hasOptions) {
        await supabase
          .from("product_variants")
          .delete()
          .eq("product_id", savedProductId);
      }

      setSaveSuccess(isEditMode ? "Product updated successfully!" : "Product created successfully!");
    } catch (err) {
      console.error("Error saving product:", err);
      setSaveError(err instanceof Error ? err.message : "An unexpected error occurred while saving.");
    } finally {
      setUploadProgress(false);
    }
  };

  return (
    <div>
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-emerald-600 text-white">
          {saveSuccess}
        </div>
      )}
      {saveError && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-red-600 text-white">
          {saveError}
        </div>
      )}

      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/products" className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Back to products">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7 7l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{isEditMode ? "Edit Product" : "Add Product"}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {isEditMode ? "Update the details of this paddle" : "Enter the details of the new paddle"}
            </p>
          </div>
      </div>
      </div>

      {fetchError && (
        <div className="text-red-500 text-center py-12">{fetchError}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Basic Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
            <input
              type="text"
              {...register("name", { required: "Product name is required" })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="e.g. RPM Q2"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

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
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Paddle Image</h3>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              dragOver
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-200 hover:border-gray-300 bg-gray-50"
            }`}
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

          <input type="hidden" {...register("image")} />
        </div>

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
                              {[variant.size, variant.color, variant.shape].filter(Boolean).join(" / ") || "Empty variant"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">{variant.image || "No image"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditVariant(index)}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 transition-colors"
                            title="Edit variant"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => removeVariant(index)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove variant"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700">
                  {editingVariantIndex !== null ? "Edit Variant" : "Add New Variant"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Size</label>
                    <input
                      type="text"
                      value={newVariant.size}
                      onChange={(e) => setNewVariant((prev) => ({ ...prev, size: e.target.value }))}
                      placeholder="e.g. 16mm"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                    <input
                      type="text"
                      value={newVariant.color}
                      onChange={(e) => setNewVariant((prev) => ({ ...prev, color: e.target.value }))}
                      placeholder="e.g. Black"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Shape</label>
                    <select
                      value={newVariant.shape}
                      onChange={(e) => setNewVariant((prev) => ({ ...prev, shape: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    >
                      <option value="">Select shape...</option>
                      {AVAILABLE_SHAPES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Variant Image</label>
                  <div className="flex items-center gap-3">
                    <input
                      ref={variantFileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleVariantFileChange}
                    />
                    <button
                      type="button"
                      onClick={() => variantFileInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {newVariant.image ? "Change Image" : "Upload Image"}
                    </button>
                    {newVariant.image && (
                      <div className="flex items-center gap-2">
                        <img
                          src={newVariant.image}
                          alt="Preview"
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 border border-gray-200"
                          onError={(e) => { e.currentTarget.style.display = "none"; }}
                        />
                        <button
                          type="button"
                          onClick={() => setNewVariant((prev) => ({ ...prev, image: "" }))}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Stock Status</label>
                  <select
                    value={newVariant.stock_status}
                    onChange={(e) => setNewVariant((prev) => ({ ...prev, stock_status: e.target.value as ProductVariant['stock_status'] }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  >
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {editingVariantIndex !== null ? (
                    <>
                      <button
                        type="button"
                        onClick={saveEditedVariant}
                        disabled={!newVariant.size && !newVariant.color && !newVariant.shape}
                        className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditVariant}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={addVariant}
                      disabled={!newVariant.size && !newVariant.color && !newVariant.shape}
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Add Variant
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || uploadProgress}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {(isSubmitting || uploadProgress) ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              isEditMode ? "Update Product" : "Create Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
