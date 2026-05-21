"use client";

import type {
  CourierResult,
  SelectedShipping,
} from "@/lib/types";

import { formatRupiah } from "@/lib/helpers";

type Props = {
  results: CourierResult[];
  selected: SelectedShipping | null;
  onSelect: (shipping: SelectedShipping) => void;
  loading: boolean;
};

export default function OngkirResult({
  results,
  selected,
  onSelect,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="text-sm text-gray-500">
        Menghitung ongkir...
      </div>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {results.map((service) => {
        const isSelected =
          selected?.courier === service.code &&
          selected?.service === service.service;

        return (
          <button
            key={`${service.code}-${service.service}`}
            type="button"
            onClick={() =>
              onSelect({
                courier: service.code,
                courierName: service.name,
                service: service.service,
                description: service.description,
                cost: service.cost,
                etd: service.etd,
              })
            }
            className={`w-full border rounded-xl p-4 text-left transition ${
              isSelected
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-800">
                  {service.service}
                </p>

                <p className="text-sm text-gray-500">
                  {service.description}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Estimasi {service.etd}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-blue-700">
                  {formatRupiah(service.cost)}
                </p>

                {isSelected && (
                  <p className="text-xs text-blue-600 mt-1">
                    Dipilih
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}