import PageHeader from "@/components/ui/PageHeader";
import BrandForm from "@/components/studio/BrandForm";
import { createBrand } from "../actions";

export default function NewBrandPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="New brand"
      />
      <BrandForm action={createBrand} submitLabel="Create brand" />
    </div>
  );
}
