import { useEffect, useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase, isSupabaseConfigured, uploadProductImage } from "./lib/supabase";
import { products as localProducts } from "./data/products";
import { logAdminActivity } from "./lib/activity";

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
  "RPM",
  "CRBN",
  "JOOLA",
  "Honolulu",
  "Franklin",
  "Kamito",
  "Selkirk",
  "Bread and Butter",
  "Sypik",
  "Luzz",
  "Friday",
];

const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 5;

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
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

  useEffect(() => {
    if (isEditMode) {
      if (!isSupabaseConfigured) {
        const product = localProducts.find((p) => p.id === Number(id));
        if (!product) {
          setFetchError("Product not found.");
          navigate("/admin/products");
          return;
        }
        originalProductRef.current = product;
        resetForm(product);
        return;
      }

      const fetchProduct = async () => {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          console.error("Error fetching product:", error);
          setFetchError("Failed to fetch product.");
          navigate("/admin/products");
        } else {
          originalProductRef.current = data;
          const product = data as any;
          resetForm({
            name: product.name || "",
            brand: product.brand || "",
            price: product.price || 0,
            description: product.description || "",
            stockStatus: product.stock_status || product.stockStatus || "In Stock",
            featured: product.featured || false,
            is_new: product.is_new || false,
            image: product.image || "",
          } as any);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode, navigate, reset]);

  const resetForm = (product: any) => {
    const imageVal = product.image || "";
    reset({
      name: product.name || "",
      brand: product.brand || "",
      price: product.price || 0,
      description: product.description || "",
      stockStatus: product.stockStatus || product.stock_status || "In Stock",
      featured: product.featured || false,
      is_new: product.is_new || false,
      image: imageVal,
    });
    setImagePreview(imageVal || null);
  };

  const validateAndSetFile = useCallback((file: File | null) => {
    setFileError(null);
    if (!file) return;

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError("Invalid file type. Allowed: JPG, JPEG, PNG, WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File too large. Maximum is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    selectedFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = () => {
    const file = fileInputRef.current?.files?.[0] ?? null;
    validateAndSetFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0] ?? null;
      validateAndSetFile(file);
    },
    [validateAndSetFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleRemoveImage = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    selectedFileRef.current = null;
    setImagePreview(null);
    setFileError(null);
    setValue("image", "");
  };

  const onSubmit = async (formData: FormData) => {
    setSaveError(null);
    setSaveSuccess(null);

    try {
      let imageFile = selectedFileRef.current;
      if (!imageFile) {
        imageFile = fileInputRef.current?.files?.[0] ?? null;
      }

      let imageUrl = formData.image;
      let imageAction: string | null = null;

      if (imageFile) {
        if (!isSupabaseConfigured) {
          imageUrl =
            "/paddles/" + formData.name.replace(/\s+/g, "").toUpperCase() + ".png";
        } else {
          setUploadProgress(true);
          const oldImageUrl = isEditMode ? formData.image : undefined;
          imageUrl = await uploadProductImage(imageFile, oldImageUrl);
          setUploadProgress(false);
        }
        imageAction = isEditMode && formData.image ? "image_replaced" : "image_uploaded";
      } else if (isEditMode && !imageUrl && formData.image) {
        // Image was removed
        imageAction = "image_removed";
      }

      const productData = {
        name: formData.name,
        brand: formData.brand,
        price: Number(formData.price),
        description: formData.description,
        stock_status: formData.stockStatus,
        featured: formData.featured,
        is_new: formData.is_new,
        image: imageUrl || "",
        updated_at: new Date().toISOString(),
      };

      if (!isSupabaseConfigured) {
        setSaveSuccess(
          isEditMode ? "Product updated (demo mode)" : "Product created (demo mode)"
        );
        setTimeout(() => navigate("/admin/products"), 1000);
        return;
      }

      if (isEditMode) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", id);
        if (error) throw new Error("Database update failed: " + error.message);

        // Build activity description
        const original = originalProductRef.current;
        let changes: string[] = [];
        if (original && original.price !== productData.price)
          changes.push("price changed");
        if (
          original &&
          (original.stock_status || original.stockStatus) !== productData.stock_status
        )
          changes.push("stock status changed");
        if (imageAction === "image_uploaded") changes.push("image uploaded");
        if (imageAction === "image_replaced") changes.push("image replaced");
        if (imageAction === "image_removed") changes.push("image removed");

        await logAdminActivity({
          action: "product_updated",
          description: `Updated ${formData.name}${
            changes.length ? " (" + changes.join(", ") + ")" : ""
          }`,
          product_id: id,
          product_name: formData.name,
          metadata: { changes },
        });
      } else {
        const { data: inserted, error } = await supabase
          .from("products")
          .insert({
            ...productData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (error) throw new Error("Database insert failed: " + error.message);

        const newId = (inserted as any)?.id;
        await logAdminActivity({
          action: "product_created",
          description: `Added ${formData.name} (${formData.brand})`,
          product_id: newId,
          product_name: formData.name,
          metadata: { brand: formData.brand, price: formData.price },
        });
      }

      navigate("/admin/products");
    } catch (error: any) {
      setUploadProgress(false);
      const message = error?.message || "An unexpected error occurred.";
      console.error("[ProductEditPage] Error saving product:", error);
      setSaveError(message);
    }
  };

  if (fetchError) {
    return <div className="text-red-500 text-center py-12">{fetchError}</div>;
  }

return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/admin/products" className="hover:text-emerald-600 transition-colors">Products</Link>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-gray-900 font-medium">{isEditMode ? "Edit" : "Add"} Paddle</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{isEditMode ? "Edit Product" : "Add New Product"}</h1>
          <p className="text-sm text-gray-500 mt-1">{isEditMode ? "Update the details of this paddle." : "Add a new paddle to your catalog."}</p>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="mb-6 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3">
          Demo Mode — Changes are simulated. Set up Supabase for real persistence.
        </div>
      )}

      {saveError && (
        <div className="mb-6 text-xs bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 whitespace-pre-wrap">{saveError}</div>
      )}

      {saveSuccess && (
        <div className="mb-6 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg px-4 py-3">{saveSuccess}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Hidden input to track image URL in react-hook-form */}
        <input type="hidden" {...register("image")} />

        {/* Product Information Section */}
        <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Product Information</h3>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"
              >
                Product Name
              </label>
              <input
                type="text"
                id="name"
                {...register("name", { required: "Product name is required" })}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="e.g. RPM Friction Pro V2"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="brand"
                  className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"
                >
                  Brand
                </label>
                <select
                  id="brand"
                  {...register("brand", { required: "Please select a brand" })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                >
                  <option value="">Select a brand</option>
                  {AVAILABLE_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                {errors.brand && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.brand.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"
                >
                  Price (PHP)
                </label>
                <input
                  type="number"
                  id="price"
                  {...register("price", {
                    required: "Price is required",
                    valueAsNumber: true,
                  })}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
                  placeholder="13000"
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"
              >
                Description
              </label>
              <textarea
                id="description"
                {...register("description")}
                rows={4}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition resize-none"
                placeholder="Describe the paddle..."
              />
            </div>
          </div>
        </div>

{/* Inventory Section */}
        <div className="bg-white rounded-xl ring-1 ring-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126Z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Inventory</h3>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label
                htmlFor="stockStatus"
                className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"
              >
                Stock Status
              </label>
              <select
                id="stockStatus"
                {...register("stockStatus")}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition"
              >
                <option value="In Stock">In Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8 pt-1">
              <label className="relative inline-flex items-center cursor-pointer gap-3">
                <input
                  type="checkbox"
                  {...register("featured")}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="text-sm text-gray-700">Featured Product</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer gap-3">
                <input
                  type="checkbox"
                  {...register("is_new")}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="text-sm text-gray-700">New Product</span>
              </label>
            </div>
          </div>
        </div>

        {/* Product Image Section */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">
              Product Image
            </h3>
          </div>
          <div className="p-5">
            {imagePreview ? (
              <div className="space-y-4">
                <div className="w-full max-w-[240px] aspect-square bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mx-auto">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain p-3"
                  />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"
                      />
                    </svg>
                    Replace
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    Remove
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  Supported: JPG, JPEG, PNG, WebP (max {MAX_FILE_SIZE_MB} MB)
                </p>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center py-10 px-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? "border-emerald-400 bg-emerald-50/50"
                    : "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <svg
                  className={`w-10 h-10 mb-3 transition-colors ${
                    dragOver ? "text-emerald-500" : "text-gray-300"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                  />
                </svg>
                <p
                  className={`text-sm font-medium transition-colors ${
                    dragOver ? "text-emerald-600" : "text-gray-500"
                  }`}
                >
                  {dragOver ? "Drop image here" : "Upload an image"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Drag & drop or click to browse
                </p>
                <p className="text-[10px] text-gray-300 mt-1">
                  JPG, JPEG, PNG, WebP (max {MAX_FILE_SIZE_MB} MB)
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            )}
            {fileError && (
              <p className="mt-2 text-xs text-red-500 text-center">
                {fileError}
              </p>
            )}
            {imagePreview && uploadProgress && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-600">
                <span className="inline-block w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                Uploading image...
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
          <Link
            to="/admin/products"
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || uploadProgress}
            className="px-5 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {uploadProgress ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Uploading...
              </>
            ) : isSubmitting ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : isEditMode ? (
              "Update Product"
            ) : (
              "Create Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

