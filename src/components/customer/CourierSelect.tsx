"use client";
// ============================================================
// components/checkout/CourierSelect.tsx
// Pilih kurir pengiriman dengan card visual
// ============================================================

import type { Courier } from "@/lib/types";

type CourierOption = {
  id: Courier;
  name: string;
  description: string;
  logo: string; // emoji placeholder (ganti dengan <Image> jika punya logo asli)
  color: string;
};

const COURIER_OPTIONS: CourierOption[] = [
  {
    id: "jne",
    name: "JNE",
    description: "Jalur Nugraha Ekakurir",
    logo: "🚚",
    color: "from-red-50 to-red-100 border-red-200",
  },
  {
    id: "tiki",
    name: "TIKI",
    description: "Titipan Kilat",
    logo: "📦",
    color: "from-blue-50 to-blue-100 border-blue-200",
  },
  {
    id: "pos",
    name: "POS Indonesia",
    description: "Pos Indonesia",
    logo: "🏣",
    color: "from-orange-50 to-orange-100 border-orange-200",
  },
];

type Props = {
  selected: Courier | "";
  onChange: (courier: Courier) => void;
  disabled?: boolean;
};

export default function CourierSelect({ selected, onChange, disabled }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-stone-700">
        Kurir Pengiriman <span className="text-red-500">*</span>
      </label>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
        {COURIER_OPTIONS.map((courier) => {
          const isSelected = selected === courier.id;

          return (
            <button
              key={courier.id}
              type="button"
              onClick={() => !disabled && onChange(courier.id)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2
                bg-gradient-to-b transition-all duration-150 text-center
                focus:outline-none focus:ring-2 focus:ring-amber-400
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}
                ${
                  isSelected
                    ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                    : `${courier.color}`
                }
              `}
              aria-pressed={isSelected}
            >
              {/* Checkmark indicator */}
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}

              <span className="text-2xl" role="img" aria-label={courier.name}>
                {courier.logo}
              </span>
              <span className={`text-sm font-bold ${isSelected ? "text-amber-700" : "text-stone-700"}`}>
                {courier.name}
              </span>
              <span className="text-[10px] text-stone-400 leading-tight hidden sm:block">
                {courier.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
