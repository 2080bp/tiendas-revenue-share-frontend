// ── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  phone: string
  role: 'admin' | 'owner' | 'customer'
}

export interface AuthTokens {
  access: string
  refresh: string
}

// ── Planes ───────────────────────────────────────────────────────────────────
export interface Plan {
  id: number
  tier: 'free' | 'starter' | 'pro' | 'business'
  name: string
  price_monthly_clp: string
  price_monthly_usd: string
  max_products: number
  max_orders_per_month: number
  max_dropshipping_integrations: number
  max_staff_users: number
  has_ai_content_agent: boolean
  has_whatsapp_integration: boolean
  has_custom_domain: boolean
  has_analytics_advanced: boolean
  has_multi_language: boolean
  has_abandoned_cart_recovery: boolean
  has_priority_support: boolean
}

// ── Tienda ───────────────────────────────────────────────────────────────────
export interface Store {
  id: number
  name: string
  slug: string
  plan: Plan | null
  plan_expires_at: string | null
  trial_plan: Plan | null
  trial_expires_at: string | null
  is_on_trial: boolean
  is_subscription_active: boolean
  active_plan: Plan | null
  country_code: string
  currency_code: string
  language_code: string
  logo_url: string
  primary_color: string
  contact_email: string
  contact_phone: string
  whatsapp_number: string
  custom_domain: string
  is_active: boolean
  created_at: string
}

export interface PlanStatus {
  is_on_trial: boolean
  trial_expires_at: string | null
  is_subscription_active: boolean
  plan_expires_at: string | null
  active_plan: Plan | null
  features: {
    ai_content_agent: boolean
    whatsapp_integration: boolean
    custom_domain: boolean
    analytics_advanced: boolean
    multi_language: boolean
    abandoned_cart_recovery: boolean
    priority_support: boolean
  }
  limits: {
    max_products: number
    max_orders_per_month: number
    max_dropshipping_integrations: number
  }
}

// ── Catálogo ─────────────────────────────────────────────────────────────────
export interface Category {
  id: number
  name: string
  slug: string
  parent: number | null
}

export interface ProductVariant {
  id: number
  name: string
  sku: string
  price: string | null
  cost_price: string | null
  stock: number
  image_url: string
  attributes: Record<string, string>
  is_active: boolean
  effective_price: string
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description: string
  sku: string
  source: 'own' | 'dropshipping'
  category: number | null
  category_name: string
  price: string
  compare_at_price: string | null
  cost_price: string | null
  stock_mode: 'tracked' | 'infinite' | 'made_to_order'
  stock: number
  image: string
  image_url: string
  main_image: string
  meta_title: string
  meta_description: string
  is_active: boolean
  is_featured: boolean
  is_in_stock: boolean
  margin: string | null
  margin_percent: number | null
  variants: ProductVariant[]
  created_at: string
  updated_at: string
}

// ── API helpers ───────────────────────────────────────────────────────────────
export interface ApiError {
  detail?: string
  [key: string]: unknown
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
