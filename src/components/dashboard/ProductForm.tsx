'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogApi } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { Card, CardHeader } from '@/components/ui/Card'
import type { Product, Category } from '@/types'
import { ImageIcon, Save, Trash2, Eye, Sparkles, Loader2, Copy, Check, Share2, Facebook } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductFormProps {
  product?: Product
}

const TONES = [
  { value: 'moderno',    label: 'Moderno'    },
  { value: 'formal',     label: 'Formal'     },
  { value: 'divertido',  label: 'Divertido'  },
  { value: 'minimalista',label: 'Minimalista'},
]

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const qc = useQueryClient()
  const isEditing = !!product

  const [form, setForm] = useState({
    name:              product?.name || '',
    short_description: product?.short_description || '',
    description:       product?.description || '',
    category:          product?.category?.toString() || '',
    sku:               product?.sku || '',
    price:             product?.price || '',
    compare_at_price:  product?.compare_at_price || '',
    cost_price:        product?.cost_price || '',
    stock_mode:        product?.stock_mode || 'tracked',
    stock:             product?.stock?.toString() || '0',
    image_url:         product?.image_url || '',
    meta_title:        product?.meta_title || '',
    meta_description:  product?.meta_description || '',
    is_active:         product?.is_active ?? true,
    is_featured:       product?.is_featured ?? false,
  })

  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [aiTone, setAiTone]         = useState('moderno')
  const [aiLoading, setAiLoading]   = useState(false)
  const [aiError, setAiError]       = useState('')
  const [socialPlatform, setSP]     = useState('instagram')
  const [socialLoading, setSL]      = useState(false)
  const [socialPost, setSocialPost] = useState('')
  const [copied, setCopied]         = useState(false)

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => catalogApi.categories().then(r =>
      Array.isArray(r.data) ? r.data : r.data.results ?? []
    ),
  })

  const set = (k: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm(p => ({ ...p, [k]: e.target.value }))

  const mutation = useMutation({
    mutationFn: (data: typeof form) =>
      isEditing
        ? catalogApi.updateProduct(product!.id, data)
        : catalogApi.createProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-products'] })
      router.push('/dashboard/products')
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: Record<string, string[]> } }
      const data = e?.response?.data || {}
      const flat: Record<string, string> = {}
      Object.entries(data).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? v[0] : String(v) })
      setErrors(flat)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => catalogApi.deleteProduct(product!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-products'] })
      router.push('/dashboard/products')
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    mutation.mutate(form)
  }

  async function handleAiDescription() {
    if (!form.name.trim()) { setAiError('Primero escribe el nombre del producto.'); return }
    setAiLoading(true)
    setAiError('')
    try {
      const catName = categories.find(c => String(c.id) === form.category)?.name || ''
      const { data } = await catalogApi.aiDescription({
        name: form.name,
        category: catName,
        price: form.price,
        tone: aiTone,
      })
      setForm(p => ({
        ...p,
        description:      data.description      || p.description,
        meta_title:       data.meta_title        || p.meta_title,
        meta_description: data.meta_description  || p.meta_description,
      }))
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } }
      setAiError(e?.response?.data?.detail || 'Error al generar contenido. Intenta de nuevo.')
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSocialPost() {
    if (!form.name.trim()) return
    setSL(true)
    setSocialPost('')
    try {
      const { data } = await catalogApi.aiSocialPost({
        name: form.name,
        price: form.price,
        platform: socialPlatform,
      })
      setSocialPost(data.post || '')
    } catch {
      setSocialPost('Error al generar el post. Intenta de nuevo.')
    } finally {
      setSL(false)
    }
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Calcula margen en vivo
  const price  = parseFloat(form.price) || 0
  const cost   = parseFloat(form.cost_price) || 0
  const margin = price > 0 && cost > 0 ? ((price - cost) / price * 100).toFixed(1) : null

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {isEditing ? product.name : 'Completa la información del producto'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing && (
            <Button type="button" variant="ghost" size="sm"
              onClick={() => window.open(`/preview/${product.slug}`, '_blank')}>
              <Eye size={14} /> Vista previa
            </Button>
          )}
          {isEditing && (
            <Button type="button" variant="danger" size="sm"
              loading={deleteMutation.isPending}
              onClick={() => { if (confirm('¿Eliminar este producto?')) deleteMutation.mutate() }}>
              <Trash2 size={14} /> Eliminar
            </Button>
          )}
          <Button type="submit" loading={mutation.isPending}>
            <Save size={14} /> {isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-5">

          {/* Información básica */}
          <Card>
            <CardHeader title="Información básica" />
            <div className="space-y-4">
              <Input label="Nombre del producto *" required
                value={form.name} onChange={set('name')}
                error={errors.name} placeholder="Ej: Camiseta Oversized Negra" />
              <Input label="Descripción corta"
                value={form.short_description} onChange={set('short_description')}
                error={errors.short_description}
                placeholder="Una línea que aparece en la lista de productos (máx 300 caracteres)"
                maxLength={300} />

              {/* Descripción + botón IA */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Descripción completa
                  </label>
                  <div className="flex items-center gap-2">
                    <select value={aiTone} onChange={e => setAiTone(e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                      {TONES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <button type="button" onClick={handleAiDescription} disabled={aiLoading || !form.name.trim()}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition">
                      {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Generar con IA
                    </button>
                  </div>
                </div>
                {aiError && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-2">{aiError}</p>
                )}
                <Textarea rows={5}
                  value={form.description} onChange={set('description')}
                  error={errors.description}
                  placeholder="Describe el producto, materiales, instrucciones de cuidado, etc." />
              </div>
            </div>
          </Card>

          {/* Precios */}
          <Card>
            <CardHeader title="Precios" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Precio de venta *" required type="number" min="0" step="1"
                value={form.price} onChange={set('price')}
                error={errors.price} placeholder="15990" />
              <Input label="Precio comparativo (tachado)" type="number" min="0" step="1"
                value={form.compare_at_price} onChange={set('compare_at_price')}
                hint="Precio original antes de descuento" placeholder="19990" />
              <Input label="Costo del producto" type="number" min="0" step="1"
                value={form.cost_price} onChange={set('cost_price')}
                hint="Solo tú lo ves — calcula tu margen" placeholder="7000" />
              <div className="flex items-end">
                {margin !== null ? (
                  <div className={cn('p-3 rounded-lg w-full text-center',
                    parseFloat(margin) >= 30 ? 'bg-emerald-50' : 'bg-amber-50'
                  )}>
                    <p className="text-xs text-gray-500 mb-1">Margen estimado</p>
                    <p className={cn('text-2xl font-black',
                      parseFloat(margin) >= 30 ? 'text-emerald-600' : 'text-amber-600'
                    )}>{margin}%</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg w-full bg-gray-50 text-center">
                    <p className="text-xs text-gray-400">Ingresa precio y costo para ver el margen</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Stock */}
          <Card>
            <CardHeader title="Inventario" />
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Tipo de stock
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'tracked',       label: 'Controlado',    desc: 'Llevas conteo' },
                    { value: 'infinite',      label: 'Ilimitado',     desc: 'Dropshipping' },
                    { value: 'made_to_order', label: 'Bajo pedido',   desc: 'Sin stock previo' },
                  ].map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => setForm(p => ({ ...p, stock_mode: opt.value as 'tracked' | 'infinite' | 'made_to_order' }))}
                      className={cn('p-3 border rounded-lg text-left transition',
                        form.stock_mode === opt.value
                          ? 'border-black bg-black text-white'
                          : 'border-gray-200 hover:border-gray-300'
                      )}>
                      <p className="text-xs font-bold">{opt.label}</p>
                      <p className={cn('text-xs mt-0.5', form.stock_mode === opt.value ? 'text-gray-300' : 'text-gray-400')}>
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {form.stock_mode === 'tracked' && (
                  <Input label="Cantidad en stock" type="number" min="0"
                    value={form.stock} onChange={set('stock')} error={errors.stock} />
                )}
                <Input label="SKU" value={form.sku} onChange={set('sku')}
                  hint="Código interno del producto" placeholder="CAM-NEG-M" />
              </div>
            </div>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader title="SEO" subtitle="Cómo apareces en Google" />
            <div className="space-y-4">
              <Input label="Título SEO" value={form.meta_title} onChange={set('meta_title')}
                hint="Máx 70 caracteres" maxLength={70}
                placeholder="Camiseta Oversized Negra | Tu Tienda" />
              <Textarea label="Descripción SEO" rows={3}
                value={form.meta_description} onChange={set('meta_description')}
                hint="Máx 160 caracteres" maxLength={160}
                placeholder="Descripción que aparece en los resultados de Google..." />
            </div>
          </Card>

          {/* IA — Redes Sociales */}
          <Card>
            <CardHeader
              title="Agente IA — Post para redes"
              subtitle="Genera contenido listo para publicar"
            />
            <div className="space-y-4">
              <div className="flex gap-2">
                {[
                  { value: 'instagram', icon: Share2, label: 'Instagram' },
                  { value: 'facebook',  icon: Facebook,  label: 'Facebook'  },
                  { value: 'tiktok',    icon: null,      label: 'TikTok'    },
                ].map(p => (
                  <button key={p.value} type="button"
                    onClick={() => setSP(p.value)}
                    className={cn('flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition',
                      socialPlatform === p.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    )}>
                    {p.icon && <p.icon size={13} />}
                    {p.label}
                  </button>
                ))}
                <button type="button" onClick={handleSocialPost}
                  disabled={socialLoading || !form.name.trim()}
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 transition">
                  {socialLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Generar post
                </button>
              </div>

              {socialLoading && (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin text-indigo-500" />
                  <p className="text-sm text-gray-500">Generando post con IA...</p>
                </div>
              )}

              {socialPost && !socialLoading && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-4 relative">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{socialPost}</pre>
                  <button type="button" onClick={() => handleCopy(socialPost)}
                    className="absolute top-3 right-3 flex items-center gap-1 text-xs text-indigo-600 bg-white border border-indigo-200 px-2 py-1 rounded-lg hover:bg-indigo-50 transition">
                    {copied ? <Check size={11} /> : <Copy size={11} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">

          {/* Imagen */}
          <Card>
            <CardHeader title="Imagen principal" />
            <div className="space-y-3">
              {form.image_url ? (
                <div className="relative">
                  <img src={form.image_url} alt="preview"
                    className="w-full aspect-square object-cover rounded-xl border border-gray-100" />
                  <button type="button" onClick={() => setForm(p => ({ ...p, image_url: '' }))}
                    className="absolute top-2 right-2 bg-white border border-gray-200 rounded-lg p-1.5 hover:bg-red-50 transition">
                    <Trash2 size={12} className="text-gray-500" />
                  </button>
                </div>
              ) : (
                <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2">
                  <ImageIcon size={32} className="text-gray-300" />
                  <p className="text-xs text-gray-400 text-center">Pega una URL de imagen abajo</p>
                </div>
              )}
              <Input label="URL de imagen" type="url" value={form.image_url}
                onChange={set('image_url')} placeholder="https://..." />
            </div>
          </Card>

          {/* Organización */}
          <Card>
            <CardHeader title="Organización" />
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
                  Categoría
                </label>
                <select value={form.category} onChange={set('category')}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white">
                  <option value="">Sin categoría</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Estado */}
          <Card>
            <CardHeader title="Visibilidad" />
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_active}
                  onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded" />
                <div>
                  <p className="text-sm font-medium">Producto activo</p>
                  <p className="text-xs text-gray-400">Visible en tu tienda</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.is_featured}
                  onChange={e => setForm(p => ({ ...p, is_featured: e.target.checked }))}
                  className="w-4 h-4 rounded" />
                <div>
                  <p className="text-sm font-medium">Producto destacado</p>
                  <p className="text-xs text-gray-400">Aparece en la portada</p>
                </div>
              </label>
            </div>
          </Card>

          {/* IA — badge si no tiene plan Pro */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-indigo-600" />
              <p className="text-sm font-bold text-indigo-800">Agente IA</p>
            </div>
            <p className="text-xs text-indigo-700 leading-relaxed">
              Genera descripciones SEO, posts para redes y contenido de marketing con un click. Disponible en plan Pro.
            </p>
          </div>

          {errors.non_field_errors && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
              {errors.non_field_errors}
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
