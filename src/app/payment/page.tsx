'use client'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { CheckCircle2, XCircle, ShoppingBag } from 'lucide-react'

function PaymentResult() {
  const params = useSearchParams()
  const order   = params.get('order') || ''
  const status  = params.get('payment')   // 'success' | 'failed'
  const success = status === 'success'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">

        {success ? (
          <>
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            <h1 className="text-2xl font-black mb-2">¡Pago exitoso!</h1>
            <p className="text-gray-500 mb-2">Tu pedido fue recibido y confirmado.</p>
            {order && (
              <p className="text-sm font-mono bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 inline-block my-4 text-gray-700">
                {order}
              </p>
            )}
            <p className="text-sm text-gray-400 mb-8">
              Recibirás un email con los detalles de tu pedido en breve.
            </p>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={48} className="text-red-400" />
            </div>
            <h1 className="text-2xl font-black mb-2">Pago no completado</h1>
            <p className="text-gray-500 mb-2">El pago fue rechazado o cancelado.</p>
            {order && (
              <p className="text-sm text-gray-400 mb-4">
                Referencia: <span className="font-mono">{order}</span>
              </p>
            )}
            <p className="text-sm text-gray-400 mb-8">
              No se realizó ningún cargo. Puedes intentarlo nuevamente.
            </p>
          </>
        )}

        <div className="flex flex-col gap-3">
          <Link href="/"
            className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition flex items-center justify-center gap-2">
            <ShoppingBag size={16} />
            Volver a la tienda
          </Link>
          {!success && (
            <button onClick={() => window.history.back()}
              className="w-full py-3 border border-gray-200 font-semibold rounded-xl hover:bg-gray-50 transition text-sm">
              Intentar de nuevo
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">Cargando...</div>}>
      <PaymentResult />
    </Suspense>
  )
}
