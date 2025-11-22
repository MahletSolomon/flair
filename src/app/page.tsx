import { BarcodeScannerForm } from "@/components/barcode/BarcodeScannerForm";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Barcode Inventory
        </h1>
        <BarcodeScannerForm />
      </div>
    </main>
  );
}
