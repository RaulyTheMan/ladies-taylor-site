import BrandForm from "@/components/admin/BrandForm";
import Breadcrumbs from "@/components/admin/Breadcrumbs";
import { createBrand } from "../actions";
import { ADMIN_H1_CLASS } from "@/lib/admin/ui";

export default function NewBrandPage() {
  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Brands", href: "/admin/brands" }, { label: "New Brand" }]}
      />
      <h1 className={ADMIN_H1_CLASS}>
        New Brand
      </h1>
      <BrandForm action={createBrand} />
    </div>
  );
}
