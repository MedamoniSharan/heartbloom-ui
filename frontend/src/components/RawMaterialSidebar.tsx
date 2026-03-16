import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Package, X, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { rawMaterialsApi, type ApiRawMaterial } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/stores/productStore";

interface RawMaterialSidebarProps {
  open: boolean;
  onClose: () => void;
  equipment: Product | null;
}

interface SelectedVariant {
  materialId: string;
  materialName: string;
  variantId: string;
  label: string;
  quantity: number;
  price: number;
}

export const RawMaterialSidebar = ({
  open,
  onClose,
  equipment,
}: RawMaterialSidebarProps) => {
  const [materials, setMaterials] = useState<ApiRawMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<SelectedVariant[]>([]);
  const { addToCart } = useCartStore();
  const { toast } = useToast();

  const fetchMaterials = useCallback(async () => {
    if (!equipment) return;
    setLoading(true);
    try {
      const list = await rawMaterialsApi.getByEquipment(equipment.id);
      setMaterials(list);
    } catch {
      setMaterials([]);
    }
    setLoading(false);
  }, [equipment]);

  useEffect(() => {
    if (open && equipment) {
      fetchMaterials();
      setSelected([]);
    }
  }, [open, equipment, fetchMaterials]);

  const toggleVariant = (
    material: ApiRawMaterial,
    variant: ApiRawMaterial["variants"][0]
  ) => {
    setSelected((prev) => {
      const exists = prev.find(
        (s) => s.materialId === material.id && s.variantId === variant.id
      );
      if (exists) {
        return prev.filter(
          (s) => !(s.materialId === material.id && s.variantId === variant.id)
        );
      }
      return [
        ...prev,
        {
          materialId: material.id,
          materialName: material.name,
          variantId: variant.id,
          label: variant.label,
          quantity: variant.quantity,
          price: variant.price,
        },
      ];
    });
  };

  const isChecked = (materialId: string, variantId: string) =>
    selected.some(
      (s) => s.materialId === materialId && s.variantId === variantId
    );

  const totalPrice = selected.reduce((sum, s) => sum + s.price, 0);

  const handleAddToCart = () => {
    selected.forEach((s) => {
      const product: Product = {
        id: `raw-${s.materialId}-${s.variantId}`,
        name: `${s.materialName} — ${s.label}`,
        description: `Raw material for ${equipment?.name || "equipment"}`,
        price: s.price,
        image: equipment?.image || "",
        category: "Raw Materials",
        rating: 0,
        reviews: 0,
        inStock: true,
      };
      addToCart(product);
    });
    toast({
      title: "Added to cart!",
      description: `${selected.length} raw material${selected.length !== 1 ? "s" : ""} added.`,
    });
    setSelected([]);
    onClose();
  };

  const grouped = materials.reduce<Record<string, ApiRawMaterial[]>>(
    (acc, m) => {
      const key = m.group || "General";
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    },
    {}
  );

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Raw Materials
          </SheetTitle>
          {equipment && (
            <p className="text-xs text-muted-foreground">
              For {equipment.name}
            </p>
          )}
        </SheetHeader>

        <div className="py-4 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No raw materials available for this equipment yet.
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {group}
                </h3>
                <div className="space-y-3">
                  {items.map((material) => (
                    <div
                      key={material.id}
                      className="bg-card border border-border rounded-xl p-4 shadow-card"
                    >
                      <h4 className="font-display font-semibold text-foreground text-sm mb-3">
                        {material.name}
                      </h4>
                      <div className="space-y-2">
                        {material.variants.map((variant) => {
                          const checked = isChecked(material.id, variant.id);
                          return (
                            <label
                              key={variant.id}
                              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                                checked
                                  ? "bg-primary/10 border border-primary/30"
                                  : "bg-muted/30 border border-transparent hover:bg-muted/50"
                              }`}
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={() =>
                                  toggleVariant(material, variant)
                                }
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">
                                  {variant.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Qty: {variant.quantity}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-foreground font-display flex-shrink-0">
                                Rs{variant.price}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {selected.length > 0 && (
          <div className="sticky bottom-0 bg-card border-t border-border p-4 -mx-6 -mb-6 px-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {selected.length} item{selected.length !== 1 ? "s" : ""}{" "}
                  selected
                </p>
                <p className="text-xs text-muted-foreground">
                  Total: Rs{totalPrice.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelected([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <motion.button
              onClick={handleAddToCart}
              className="w-full py-3 rounded-xl bg-gradient-pink text-primary-foreground font-medium text-sm glow-pink-sm flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart — Rs{totalPrice.toLocaleString()}
            </motion.button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
