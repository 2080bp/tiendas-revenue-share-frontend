'use client'
import { formatCLP } from '@/lib/utils'
import type { CartItem } from '@/app/[store]/page'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  onUpdateQty: (id: number, qty: number) => void
}

export function CartDrawer({ open, onClose, items, total, onUpdateQty }: CartDrawerProps) {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={onClose} />
      )}

      {/* Drawer */}
      <div className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-white shadow-2xl
        transition-transform duration-300 flex flex-col
        ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-black text-lg flex items-center gap-2">
            <ShoppingBag size={18} /> Tu carrito
          </h2>
          <button onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition">
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                  {item.main_image
                    ? <img src={item.main_image} alt={item.name} className="w-full h-full object-cover" />
                    : <ShoppingBag size={20} className="m-auto mt-3 text-gray-300" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-sm font-black mt-0.5">{formatCLP(item.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-black flex-shrink-0">
                  {formatCLP(parseFloat(item.price) * item.quantity)}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-5 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-xl font-black">{formatCLP(total)}</span>
            </div>
            <button className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-sm
              hover:bg-gray-800 transition active:scale-95">
              Ir a pagar →
            </button>
            <p className="text-xs text-center text-gray-400">
              Pago seguro con Webpay y Mercado Pago
            </p>
          </div>
        )}
      </div>
    </>
  )
}
