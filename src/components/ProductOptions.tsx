import { useEffect, useMemo, useState, useCallback } from "react";
import type { Product, ProductVariant } from "../data/products";

interface ProductOptionsProps {
  product: Product;
  onVariantChange?: (variant: ProductVariant | null) => void;
}

export default function ProductOptions({
  product,
  onVariantChange,
}: ProductOptionsProps) {
  const variants = product.variants || [];

  const availableSizes = useMemo(() => {
    return Array.from(
      new Set(variants.map((variant) => variant.size).filter(Boolean))
    );
  }, [variants]);

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedShape, setSelectedShape] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const availableShapes = useMemo(() => {
    if (!selectedSize) return [];
    const shapes = variants
      .filter((v) => v.size === selectedSize && v.shape)
      .map((v) => v.shape!);
    return Array.from(new Set(shapes));
  }, [variants, selectedSize]);

  const availableColors = useMemo(() => {
    if (!selectedSize || !selectedShape) return [];
    const colors = variants
      .filter((v) => v.size === selectedSize && v.shape === selectedShape && v.color)
      .map((v) => v.color!);
    return Array.from(new Set(colors));
  }, [variants, selectedSize, selectedShape]);

  const notifyVariant = useCallback(() => {
    if (!onVariantChange) return;

    if (!selectedSize && !selectedShape && !selectedColor) {
      onVariantChange(null);
      return;
    }

    for (const v of variants) {
      if (v.size === selectedSize && v.shape === selectedShape && v.color === selectedColor) {
        onVariantChange(v);
        return;
      }
    }

    onVariantChange(null);
  }, [selectedSize, selectedShape, selectedColor, variants, onVariantChange]);

  useEffect(() => {
    if (variants.length === 0) {
      setSelectedSize("");
      setSelectedShape("");
      setSelectedColor("");
      return;
    }
    const firstVariant = variants[0];
    const initialSize = firstVariant.size || "";
    setSelectedSize(initialSize);

    const shapesForFirstSize = Array.from(new Set(variants.filter(v => v.size === initialSize).map(v => v.shape!)));
    const initialShape = shapesForFirstSize.length > 0 ? shapesForFirstSize[0] : "";
    setSelectedShape(initialShape);

    const colorsForFirstSelection = Array.from(new Set(variants.filter(v => v.size === initialSize && v.shape === initialShape).map(v => v.color!)));
    const initialColor = colorsForFirstSelection.length > 0 ? colorsForFirstSelection[0] : "";
    setSelectedColor(initialColor);
  }, [product.id, variants]);

  useEffect(() => {
    notifyVariant();
  }, [notifyVariant]);

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    const shapesForSize = Array.from(new Set(variants.filter(v => v.size === size).map(v => v.shape!)));
    const newShape = shapesForSize.length > 0 ? shapesForSize[0] : "";
    setSelectedShape(newShape);

    const colorsForSelection = Array.from(new Set(variants.filter(v => v.size === size && v.shape === newShape).map(v => v.color!)));
    const newColor = colorsForSelection.length > 0 ? colorsForSelection[0] : "";
    setSelectedColor(newColor);
  };

  const handleShapeClick = (shape: string) => {
    setSelectedShape(shape);
    const colorsForSelection = Array.from(new Set(variants.filter(v => v.size === selectedSize && v.shape === shape).map(v => v.color!)));
    const newColor = colorsForSelection.length > 0 ? colorsForSelection[0] : "";
    setSelectedColor(newColor);
  };

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
  };

  if (!product.has_options && variants.length === 0) {
    return null;
  }

  if (variants.length === 0) {
    return null;
  }

  const hasSizes = availableSizes.length > 0;
  const hasShapes = availableShapes.length > 0;
  const hasColors = availableColors.length > 0;

  return (
    <div className="border-t pt-6 mt-6">
      <div className="space-y-5">
        {hasSizes && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Size:{" "}
              <span className="font-normal text-gray-600">
                {selectedSize || "Select a size"}
              </span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeClick(size)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    selectedSize === size
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {hasShapes && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Shape:{" "}
              <span className="font-normal text-gray-600">
                {selectedShape || "Select a shape"}
              </span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {availableShapes.map((shape) => (
                <button
                  key={shape}
                  type="button"
                  onClick={() => handleShapeClick(shape)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${selectedShape === shape ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"}`}
                >{shape}</button>
              ))}
            </div>
          </div>
        )}

        {hasColors && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Color:{" "}
              <span className="font-normal text-gray-600">
                {selectedColor || "Select a color"}
              </span>
            </h4>
            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorClick(color)}
                  className={`group relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    selectedColor === color
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{color}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
