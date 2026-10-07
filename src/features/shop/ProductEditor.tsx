"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  ActionButton,
  ActionFeedback,
  CheckboxGroup,
  EditorSection,
  inputClass,
  textareaClass,
} from "@/components/common/EditorSection";
import { Badge, Button, Input } from "@/components/ui";
import { MediaGallery, type GalleryItem } from "@/features/venue/MediaGallery";
import type { ActionResult } from "@/lib/actions/result";
import {
  addBrandAction,
  createProductAction,
  deleteVariantAction,
  productStatusAction,
  saveVariantAction,
  setProductCategoriesAction,
  setProductMediaAction,
  setProductSportsAction,
  updateProductAction,
  type ProductDetailsInput,
  type VariantInput,
} from "./actions";
import type { Brand, SellerProduct, SellerVariant, ShopSport } from "./api";

const TAX_RATES = [0, 5, 12, 18, 28];

function DetailsFields({
  value,
  onChange,
  brands,
  orgId,
  onBrandAdded,
}: {
  value: ProductDetailsInput;
  onChange: (v: ProductDetailsInput) => void;
  brands: Brand[];
  orgId: string;
  onBrandAdded: (brand: Brand) => void;
}) {
  const [newBrand, setNewBrand] = useState("");
  const [brandResult, setBrandResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Product name"
        value={value.name}
        maxLength={150}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Description</span>
        <textarea
          className={textareaClass}
          value={value.description ?? ""}
          maxLength={5000}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Brand</span>
          <select
            className={inputClass}
            value={value.brandId ?? ""}
            onChange={(e) => onChange({ ...value, brandId: e.target.value })}
          >
            <option value="">No brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">GST rate (prices include GST)</span>
          <select
            className={inputClass}
            value={String(value.taxPercent)}
            onChange={(e) => onChange({ ...value, taxPercent: Number(e.target.value) })}
          >
            {TAX_RATES.map((r) => (
              <option key={r} value={r}>
                {r}%
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium">Brand not listed? Add it</span>
          <input className={inputClass} value={newBrand} onChange={(e) => setNewBrand(e.target.value)} />
        </label>
        <Button
          variant="secondary"
          loading={pending}
          disabled={newBrand.trim().length < 2}
          onClick={() =>
            start(async () => {
              const r = await addBrandAction(orgId, newBrand);
              setBrandResult(r);
              if (r.id) {
                onBrandAdded({ id: r.id, name: newBrand.trim(), slug: "", enabled: true });
                onChange({ ...value, brandId: r.id });
                setNewBrand("");
              }
            })
          }
        >
          Add brand
        </Button>
        <ActionFeedback result={brandResult} />
      </div>
    </div>
  );
}

function ClassificationFields({
  sports,
  selectedSports,
  onSports,
  selectedCategories,
  onCategories,
}: {
  sports: ShopSport[];
  selectedSports: string[];
  onSports: (s: string[]) => void;
  selectedCategories: string[];
  onCategories: (c: string[]) => void;
}) {
  const categories = sports.filter((s) => selectedSports.includes(s.slug));
  return (
    <div className="flex flex-col gap-4">
      <CheckboxGroup
        legend="Sports (a product can belong to several)"
        choices={sports.map((s) => ({ value: s.slug, label: s.name }))}
        selected={selectedSports}
        onChange={(next) => {
          onSports(next);
          const allowed = new Set(sports.filter((s) => next.includes(s.slug)).flatMap((s) => s.categories));
          onCategories(selectedCategories.filter((id) => [...allowed].some((c) => c.id === id)));
        }}
        columns={4}
      />
      {categories.map((s) => (
        <CheckboxGroup
          key={s.slug}
          legend={`${s.name} categories`}
          choices={s.categories.map((c) => ({ value: c.id, label: c.name }))}
          selected={selectedCategories}
          onChange={onCategories}
          columns={4}
        />
      ))}
    </div>
  );
}

/** Step one: the product starts as a draft; images, options and going live follow on its page. */
export function NewProductForm({
  orgId,
  sports,
  brands: initialBrands,
}: {
  orgId: string;
  sports: ShopSport[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [brands, setBrands] = useState(initialBrands);
  const [details, setDetails] = useState<ProductDetailsInput>({ name: "", description: "", taxPercent: 18 });
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  return (
    <EditorSection
      title="New product"
      description="Name, sports and categories first. You add images, options, prices and stock next."
      saveLabel="Create draft"
      onSave={async () => {
        const r = await createProductAction(orgId, {
          ...details,
          sports: selectedSports,
          categoryIds: categories,
        });
        if (r.id) router.push(`/shop/products/${r.id}`);
        return r;
      }}
    >
      <DetailsFields
        value={details}
        onChange={setDetails}
        brands={brands}
        orgId={orgId}
        onBrandAdded={(b) => setBrands((list) => [...list, b])}
      />
      <ClassificationFields
        sports={sports}
        selectedSports={selectedSports}
        onSports={setSelectedSports}
        selectedCategories={categories}
        onCategories={setCategories}
      />
    </EditorSection>
  );
}

function VariantRow({
  orgId,
  productId,
  variant,
  onDone,
}: {
  orgId: string;
  productId: string;
  variant?: SellerVariant;
  onDone: () => void;
}) {
  const [form, setForm] = useState<VariantInput>({
    sku: variant?.sku ?? "",
    label: variant?.label ?? "",
    price: variant?.price ?? "",
    compareAtPrice: variant?.compareAtPrice ?? "",
    onHand: variant ? undefined : 0,
    lowStockAt: variant?.lowStockAt ?? 3,
    enabled: variant?.enabled ?? true,
  });
  const [result, setResult] = useState<ActionResult>({});
  const [pending, start] = useTransition();
  const set = (key: keyof VariantInput) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-line p-3">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Input label="Option (e.g. Size 6)" value={form.label} onChange={set("label")} />
        <Input label="SKU" value={form.sku} onChange={set("sku")} />
        <Input
          label="Price (₹)"
          inputMode="decimal"
          value={String(form.price ?? "")}
          onChange={set("price")}
        />
        <Input
          label="MRP / was (₹)"
          inputMode="decimal"
          value={String(form.compareAtPrice ?? "")}
          onChange={set("compareAtPrice")}
        />
        {variant ? (
          <p className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Stock</span>
            <span>
              {variant.available} available{variant.reserved > 0 ? ` (${variant.reserved} held)` : ""}
            </span>
          </p>
        ) : (
          <Input
            label="Opening stock"
            inputMode="numeric"
            value={String(form.onHand ?? 0)}
            onChange={set("onHand")}
          />
        )}
        <Input
          label="Low-stock alert at"
          inputMode="numeric"
          value={String(form.lowStockAt ?? 3)}
          onChange={set("lowStockAt")}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {variant && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.enabled ?? true}
              onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
            />
            On sale
          </label>
        )}
        <Button
          size="sm"
          loading={pending}
          onClick={() =>
            start(async () => {
              const r = await saveVariantAction(orgId, productId, variant?.id ?? null, form);
              setResult(r);
              if (!r.error) onDone();
            })
          }
        >
          {variant ? "Save option" : "Add option"}
        </Button>
        {variant && (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (!window.confirm(`Delete option ${variant.label}?`)) return;
              start(async () => {
                const r = await deleteVariantAction(orgId, productId, variant.id);
                setResult(r);
                if (!r.error) onDone();
              });
            }}
          >
            Delete
          </Button>
        )}
        <ActionFeedback result={result} />
      </div>
    </div>
  );
}

/** Product page for the seller: details, sports & categories, images, options (price, stock), go live. */
export function ProductEditor({
  orgId,
  product,
  sports,
  brands: initialBrands,
  manager,
  customerSiteUrl,
}: {
  orgId: string;
  product: SellerProduct;
  sports: ShopSport[];
  brands: Brand[];
  manager: boolean;
  customerSiteUrl: string;
}) {
  const router = useRouter();
  const [brands, setBrands] = useState(initialBrands);
  const [details, setDetails] = useState<ProductDetailsInput>({
    name: product.name,
    description: product.description ?? "",
    brandId: product.brand?.id ?? "",
    taxPercent: product.taxPercent,
  });
  const [selectedSports, setSelectedSports] = useState(product.sports);
  const [categories, setCategories] = useState(product.categories.map((c) => c.id));
  const [media, setMedia] = useState<GalleryItem[]>(
    product.media.map((m) => ({ mediaId: m.mediaId, kind: "IMAGE", url: m.url })),
  );
  const [adding, setAdding] = useState(product.variants.length === 0);
  const refresh = () => router.refresh();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge tone={product.status === "ACTIVE" ? "success" : "neutral"}>
          {product.status.toLowerCase()}
        </Badge>
        {product.unlisted && <Badge tone="danger">Unlisted by LordOfSportz: {product.unlistReason}</Badge>}
        {product.publiclyVisible && (
          <a
            href={`${customerSiteUrl}/shop/products/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            View in the shop ↗
          </a>
        )}
        {manager &&
          (product.status === "ACTIVE" ? (
            <ActionButton
              variant="secondary"
              action={async () => {
                const r = await productStatusAction(orgId, product.id, "deactivate");
                refresh();
                return r;
              }}
            >
              Hide from shop
            </ActionButton>
          ) : (
            <ActionButton
              action={async () => {
                const r = await productStatusAction(orgId, product.id, "activate");
                refresh();
                return r;
              }}
            >
              Go live
            </ActionButton>
          ))}
      </div>

      <EditorSection
        title="Details"
        onSave={manager ? () => updateProductAction(orgId, product.id, details) : undefined}
      >
        <DetailsFields
          value={details}
          onChange={setDetails}
          brands={brands}
          orgId={orgId}
          onBrandAdded={(b) => setBrands((list) => [...list, b])}
        />
      </EditorSection>

      <EditorSection
        title="Sports and categories"
        description="The product appears in the shop of every sport you tick."
        onSave={
          manager
            ? async () => {
                const r = await setProductSportsAction(orgId, product.id, selectedSports);
                if (r.error) return r;
                return setProductCategoriesAction(orgId, product.id, categories);
              }
            : undefined
        }
      >
        <ClassificationFields
          sports={sports}
          selectedSports={selectedSports}
          onSports={setSelectedSports}
          selectedCategories={categories}
          onCategories={setCategories}
        />
      </EditorSection>

      <EditorSection
        title="Images"
        description="JPEG, PNG or WebP. The first image is the cover."
        onSave={
          manager
            ? () =>
                setProductMediaAction(
                  orgId,
                  product.id,
                  media.map((m) => m.mediaId),
                )
            : undefined
        }
      >
        <MediaGallery items={media} onChange={setMedia} allowVideo={false} purpose="PRODUCT_IMAGE" />
      </EditorSection>

      <EditorSection
        title="Options, prices and stock"
        description="Each option (size, weight, colour…) has its own SKU, price and stock. Adjust stock counts in Inventory."
      >
        <div className="flex flex-col gap-3">
          {product.variants.map((v) => (
            <VariantRow key={v.id} orgId={orgId} productId={product.id} variant={v} onDone={refresh} />
          ))}
          {manager &&
            (adding ? (
              <VariantRow
                orgId={orgId}
                productId={product.id}
                onDone={() => {
                  setAdding(false);
                  refresh();
                }}
              />
            ) : (
              <Button variant="secondary" className="self-start" onClick={() => setAdding(true)}>
                Add an option
              </Button>
            ))}
        </div>
      </EditorSection>
    </div>
  );
}
