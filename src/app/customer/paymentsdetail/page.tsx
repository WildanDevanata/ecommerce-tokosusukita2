'use client'

import { useState, useRef } from 'react'
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Smartphone,
  Building2,
  Package,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react'
import Navbar from '@/components/sharing/navbar';
import Footer from '@/components/sharing/footer';

type PaymentMethod = 'TRANSFER' | 'MIDTRANS' | 'EWALLET' | 'COD'
type PaymentStatus =
  | 'PENDING'
  | 'WAITING_VERIFICATION'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'

type BankAccount = {
  id: string
  bankName: string
  accountNumber: string
  accountName: string
  type: 'BANK' | 'EWALLET'
  color: string
  isActive: boolean
}

type OrderItem = {
  id: string
  productName: string
  quantity: number
  price: number
  productEmoji: string
  productBgColor: string
}

const banksData: BankAccount[] = [
  {
    id: 'bank1',
    bankName: 'Bank BCA',
    accountNumber: '1234567890',
    accountName: 'Toko Susu Kita',
    type: 'BANK',
    color: 'bg-blue-600',
    isActive: true,
  },
  {
    id: 'bank2',
    bankName: 'Bank BNI',
    accountNumber: '9876543210',
    accountName: 'Toko Susu Kita',
    type: 'BANK',
    color: 'bg-orange-500',
    isActive: true,
  },
  {
    id: 'ewallet1',
    bankName: 'GoPay',
    accountNumber: '081234567890',
    accountName: 'Toko Susu Kita',
    type: 'EWALLET',
    color: 'bg-green-500',
    isActive: true,
  },
]

const order = {
  id: '1',
  orderNumber: 'ORD-2026-001',
  paymentMethod: 'TRANSFER' as PaymentMethod,
  paymentStatus: 'PENDING' as PaymentStatus,
  totalAmount: 250000,
  shippingCost: 15000,
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: '1',
      productName: 'Susu Formula Bayi',
      quantity: 2,
      price: 100000,
      productEmoji: '🍼',
      productBgColor: 'bg-pink-100',
    },
    {
      id: '2',
      productName: 'Popok Bayi',
      quantity: 1,
      price: 35000,
      productEmoji: '👶',
      productBgColor: 'bg-blue-100',
    },
  ] as OrderItem[],
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('id-ID')
}

function getPaymentStatusLabel(status: PaymentStatus) {
  const labels = {
    PENDING: 'Menunggu Pembayaran',
    WAITING_VERIFICATION: 'Menunggu Verifikasi',
    PAID: 'Sudah Dibayar',
    FAILED: 'Gagal',
    REFUNDED: 'Refund',
  }

  return labels[status]
}

function getPaymentStatusColor(status: PaymentStatus) {
  const colors = {
    PENDING: 'bg-orange-100 text-orange-700',
    WAITING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
    PAID: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-purple-100 text-purple-700',
  }

  return colors[status]
}

export default function PaymentDetailPage() {
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofPreview, setProofPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [midtransStep, setMidtransStep] = useState<
    'SELECT' | 'PAYING' | 'SUCCESS'
  >('SELECT')
  const [midtransMethod, setMidtransMethod] = useState<
    'VA' | 'CC' | 'GOPAY'
  >('VA')
  const [midtransPaying, setMidtransPaying] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const subtotal = order.totalAmount - order.shippingCost

  const activeBanks = banksData.filter(
    b => b.isActive && b.type === 'BANK'
  )

  const activeEwallets = banksData.filter(
    b => b.isActive && b.type === 'EWALLET'
  )

  const alreadyUploaded = uploadSuccess
  const isVerified = order.paymentStatus === 'WAITING_VERIFICATION'
  const isPaid = order.paymentStatus === 'PAID'
  const isFailed = order.paymentStatus === 'FAILED'

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)

    setTimeout(() => {
      setCopiedField(null)
    }, 2000)
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    setProofFile(file)

    const reader = new FileReader()

    reader.onload = ev => {
      setProofPreview(ev.target?.result as string)
    }

    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!proofFile && !proofPreview) return

    setUploading(true)

    await new Promise(resolve => setTimeout(resolve, 2000))

    setUploading(false)
    setUploadSuccess(true)
  }

  const handleMidtransPay = async () => {
    setMidtransPaying(true)
    setMidtransStep('PAYING')

    await new Promise(resolve => setTimeout(resolve, 2500))

    setMidtransPaying(false)
    setMidtransStep('SUCCESS')
  }

  const paymentMethodLabel: Record<string, string> = {
    TRANSFER: 'Transfer Bank',
    MIDTRANS: 'Midtrans',
    EWALLET: 'E-Wallet',
    COD: 'Bayar di Tempat',
  }

  return (
    
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-6">
        <button className="p-2 rounded-xl hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Detail Pembayaran
          </h1>

          <p className="text-gray-500 text-sm">
            {order.orderNumber}
          </p>
        </div>
      </div>

      <PaymentStatusBanner
        paymentStatus={order.paymentStatus}
        paymentMethod={order.paymentMethod}
        label={getPaymentStatusLabel(order.paymentStatus)}
        color={getPaymentStatusColor(order.paymentStatus)}
        updatedAt={order.updatedAt}
      />

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <h3 className="font-semibold text-gray-800 mb-4">
          Item Pesanan
        </h3>

        <div className="space-y-3">
          {order.items.map(item => (
            <div
              key={item.id}
              className="flex items-center gap-3"
            >
              <div
                className={`${item.productBgColor} w-12 h-12 rounded-xl flex items-center justify-center text-2xl`}
              >
                {item.productEmoji}
              </div>

              <div className="flex-1">
                <p className="font-medium text-gray-800">
                  {item.productName}
                </p>

                <p className="text-sm text-gray-500">
                  {item.quantity} x {formatRupiah(item.price)}
                </p>
              </div>

              <span className="font-semibold text-gray-700">
                {formatRupiah(item.quantity * item.price)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>Ongkir</span>
            <span>{formatRupiah(order.shippingCost)}</span>
          </div>

          <div className="flex justify-between font-bold text-blue-700">
            <span>Total</span>
            <span>{formatRupiah(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="w-4 h-4 text-blue-600" />

          <span className="text-xs uppercase tracking-wide text-gray-500">
            Metode Pembayaran
          </span>
        </div>

        <p className="font-semibold text-gray-800">
          {paymentMethodLabel[order.paymentMethod]}
        </p>
      </div>

      {order.paymentMethod === 'MIDTRANS' && (
        <MidtransSection
          total={order.totalAmount}
          orderNumber={order.orderNumber}
          step={midtransStep}
          method={midtransMethod}
          paying={midtransPaying}
          isPaid={isPaid}
          onSelectMethod={setMidtransMethod}
          onPay={handleMidtransPay}
        />
      )}

      {order.paymentMethod === 'TRANSFER' && (
        <TransferSection
          total={order.totalAmount}
          banks={activeBanks}
          alreadyUploaded={alreadyUploaded}
          isVerified={isVerified}
          isPaid={isPaid}
          isFailed={isFailed}
          proofPreview={proofPreview}
          uploading={uploading}
          copiedField={copiedField}
          onCopy={handleCopy}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          onPickFile={() => fileInputRef.current?.click()}
        />
      )}

      {order.paymentMethod === 'EWALLET' && (
        <EwalletSection
          total={order.totalAmount}
          ewallets={activeEwallets}
          alreadyUploaded={alreadyUploaded}
          isVerified={isVerified}
          isPaid={isPaid}
          isFailed={isFailed}
          proofPreview={proofPreview}
          uploading={uploading}
          copiedField={copiedField}
          onCopy={handleCopy}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          onPickFile={() => fileInputRef.current?.click()}
        />
      )}

      {order.paymentMethod === 'COD' && (
        <CodSection total={order.totalAmount} />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

function PaymentStatusBanner({
  paymentStatus,
  paymentMethod,
  label,
  color,
  updatedAt,
}: {
  paymentStatus: string
  paymentMethod?: string
  label: string
  color: string
  updatedAt: string
}) {
  const configs: Record<
    string,
    {
      bg: string
      icon: React.ReactNode
      desc: string
    }
  > = {
    PENDING: {
      bg: 'bg-orange-50 border-orange-200',
      icon: <Clock className="w-6 h-6 text-orange-500" />,
      desc:
        paymentMethod === 'COD'
          ? 'Bayar saat paket tiba'
          : 'Segera lakukan pembayaran',
    },

    WAITING_VERIFICATION: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: (
        <RefreshCw className="w-6 h-6 text-yellow-600 animate-spin" />
      ),
      desc: 'Bukti pembayaran sedang diverifikasi',
    },

    PAID: {
      bg: 'bg-green-50 border-green-200',
      icon: <ShieldCheck className="w-6 h-6 text-green-600" />,
      desc: 'Pembayaran berhasil',
    },

    FAILED: {
      bg: 'bg-red-50 border-red-200',
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      desc: 'Pembayaran gagal',
    },

    REFUNDED: {
      bg: 'bg-purple-50 border-purple-200',
      icon: <RefreshCw className="w-6 h-6 text-purple-600" />,
      desc: 'Dana dikembalikan',
    },
  }

  const cfg = configs[paymentStatus]

  return (
    <div
      className={`rounded-2xl border p-4 mb-4 flex gap-3 ${cfg.bg}`}
    >
      {cfg.icon}

      <div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${color}`}
        >
          {label}
        </span>

        <p className="text-sm text-gray-700 mt-2">{cfg.desc}</p>

        <p className="text-xs text-gray-400 mt-1">
          {formatDateTime(updatedAt)}
        </p>
      </div>
    </div>
  )
}

function MidtransSection({
  total,
  orderNumber,
  step,
  method,
  paying,
  isPaid,
  onSelectMethod,
  onPay,
}: {
  total: number
  orderNumber: string
  step: 'SELECT' | 'PAYING' | 'SUCCESS'
  method: 'VA' | 'CC' | 'GOPAY'
  paying: boolean
  isPaid: boolean
  onSelectMethod: (m: 'VA' | 'CC' | 'GOPAY') => void
  onPay: () => void
}) {
  if (step === 'SUCCESS' || isPaid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />

        <h3 className="text-green-800 font-bold">
          Pembayaran Berhasil
        </h3>

        <p className="text-sm text-green-700 mt-1">
          {orderNumber}
        </p>
      </div>
    )
  }

  if (step === 'PAYING') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />

        <h3 className="font-bold text-blue-800">
          Memproses Pembayaran
        </h3>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-blue-200 p-5">
      <div className="bg-blue-50 rounded-xl p-4 mb-4 flex justify-between">
        <span className="text-gray-600">Total</span>

        <span className="font-bold text-blue-700">
          {formatRupiah(total)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        {[
          {
            id: 'VA',
            label: 'Virtual Account',
            emoji: '🏦',
          },
          {
            id: 'CC',
            label: 'Kartu Kredit',
            emoji: '💳',
          },
          {
            id: 'GOPAY',
            label: 'GoPay / QRIS',
            emoji: '📱',
          },
        ].map(item => (
          <button
            key={item.id}
            onClick={() =>
              onSelectMethod(item.id as 'VA' | 'CC' | 'GOPAY')
            }
            className={`w-full p-3 rounded-xl border flex items-center gap-3 ${
              method === item.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200'
            }`}
          >
            <span className="text-xl">{item.emoji}</span>

            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onPay}
        disabled={paying}
        className="w-full py-3 bg-blue-600 text-white rounded-2xl font-medium hover:bg-blue-700"
      >
        Bayar {formatRupiah(total)}
      </button>
    </div>
  )
}

function TransferSection({
  total,
  banks,
  alreadyUploaded,
  isVerified,
  isPaid,
  isFailed,
  proofPreview,
  uploading,
  copiedField,
  onCopy,
  onFileChange,
  onUpload,
  onPickFile,
}: any) {
  const [activeBank, setActiveBank] = useState(banks[0]?.id)

  const bank = banks.find((b: any) => b.id === activeBank)

  if (isPaid) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />

        <h3 className="font-bold text-green-800">
          Pembayaran Terverifikasi
        </h3>
      </div>
    )
  }

  if (isFailed) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
        <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />

        <h3 className="font-bold text-red-800">
          Pembayaran Ditolak
        </h3>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-4 h-4 text-blue-600" />

          <h3 className="font-semibold text-gray-800">
            Rekening Transfer
          </h3>
        </div>

        <div className="flex gap-2 mb-4">
          {banks.map((b: any) => (
            <button
              key={b.id}
              onClick={() => setActiveBank(b.id)}
              className={`px-3 py-2 rounded-lg border text-sm ${
                activeBank === b.id
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200'
              }`}
            >
              {b.bankName}
            </button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${bank.color} flex items-center justify-center text-white`}
            >
              🏦
            </div>

            <div>
              <p className="font-semibold">{bank.bankName}</p>

              <p className="text-xs text-gray-500">
                {bank.accountName}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-3 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">
                Nomor Rekening
              </p>

              <p className="font-bold text-lg">
                {bank.accountNumber}
              </p>
            </div>

            <button
              onClick={() =>
                onCopy(bank.accountNumber, 'rekening')
              }
            >
              {copiedField === 'rekening' ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-gray-500" />
              )}
            </button>
          </div>

          <div className="bg-blue-50 rounded-xl border border-blue-100 p-3 flex justify-between items-center">
            <div>
              <p className="text-xs text-blue-600">Total Bayar</p>

              <p className="text-xl font-bold text-blue-700">
                {formatRupiah(total)}
              </p>
            </div>

            <button
              onClick={() => onCopy(String(total), 'amount')}
            >
              {copiedField === 'amount' ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-blue-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      <UploadProofSection
        alreadyUploaded={alreadyUploaded}
        isVerified={isVerified}
        proofPreview={proofPreview}
        uploading={uploading}
        onPickFile={onPickFile}
        onFileChange={onFileChange}
        onUpload={onUpload}
      />
    </div>
  )
}

function EwalletSection(props: any) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="w-4 h-4 text-blue-600" />

        <h3 className="font-semibold text-gray-800">
          Pembayaran E-Wallet
        </h3>
      </div>

      <TransferSection {...props} />
    </div>
  )
}

function CodSection({ total }: { total: number }) {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-orange-600" />

        <h3 className="font-semibold text-orange-800">
          Bayar di Tempat
        </h3>
      </div>

      <div className="bg-white rounded-xl p-4 flex justify-between">
        <span>Total Bayar</span>

        <span className="font-bold text-orange-700">
          {formatRupiah(total)}
        </span>
      </div>
    </div>
  )
}

function UploadProofSection({
  alreadyUploaded,
  isVerified,
  proofPreview,
  uploading,
  onPickFile,
  onFileChange,
  onUpload,
}: any) {
  if (alreadyUploaded || isVerified) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />

          <div>
            <p className="font-semibold text-yellow-800">
              Menunggu Verifikasi
            </p>

            <p className="text-xs text-yellow-600">
              Bukti pembayaran sedang dicek admin
            </p>
          </div>
        </div>

        {proofPreview && (
          <img
            src={proofPreview}
            alt="Proof"
            className="mt-4 rounded-xl border max-w-xs"
          />
        )}
      </div>
    )
  }

  return (
    <>
          <Navbar />
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="w-4 h-4 text-blue-600" />

        <h3 className="font-semibold text-gray-800">
          Upload Bukti Pembayaran
        </h3>
      </div>

      {proofPreview ? (
        <div className="mb-4">
          <img
            src={proofPreview}
            alt="Preview"
            className="rounded-xl border max-w-xs"
          />

          <button
            onClick={onPickFile}
            className="text-sm text-blue-600 mt-2"
          >
            Ganti Foto
          </button>
        </div>
      ) : (
        <button
          onClick={onPickFile}
          className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4"
        >
          <div className="text-4xl mb-2">📸</div>

          <p className="font-medium text-gray-700">
            Pilih Foto Bukti Pembayaran
          </p>
        </button>
      )}

      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      <button
        onClick={onUpload}
        disabled={uploading || !proofPreview}
        className="w-full py-3 bg-orange-500 text-white rounded-2xl font-medium hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Mengupload...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Kirim Bukti Pembayaran
          </>
        )}
      </button>
    </div>
    <Footer />
        </>
  )
}