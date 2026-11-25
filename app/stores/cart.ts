import { defineStore } from 'pinia'
import { findProduct, fromPrice } from '~/data/catalog'

export interface CartLine {
  id: string
  slug: string
  size?: number
  colour?: string
  /** Name-tag shape id (medallion only) */
  design?: string
  note?: string
  /** Phone number engraved on the back (medallion only) */
  back?: string
  qty: number
}

const KEY = 'boop-cart'

export const useCart = defineStore('cart', {
  state: () => ({ lines: [] as CartLine[], open: false, hydrated: false }),
  getters: {
    count: s => s.lines.reduce((n, l) => n + l.qty, 0),
    items: s => s.lines.map(l => {
      const p = findProduct(l.slug)!
      const unit = l.size ? p.sizes!.find(x => x.cm === l.size)!.price : fromPrice(p)
      return { ...l, product: p, unit, total: unit * l.qty }
    }),
    subtotal(): number { return this.items.reduce((n, i) => n + i.total, 0) },
  },
  actions: {
    hydrate() {
      if (this.hydrated) return
      try { this.lines = JSON.parse(localStorage.getItem(KEY) || '[]') } catch { this.lines = [] }
      this.hydrated = true
      this.$subscribe((_, s) => { try { localStorage.setItem(KEY, JSON.stringify(s.lines)) } catch {} })
    },
    add(slug: string, opts: { size?: number; colour?: string; design?: string; note?: string; back?: string } = {}, qty = 1) {
      const { size, colour, design, note, back } = opts
      const id = [slug, size ?? '', design ?? '', colour ?? '', note ?? '', back ?? ''].join('|')
      const line = this.lines.find(l => l.id === id)
      if (line) line.qty += qty
      else this.lines.push({ id, slug, size, colour, design, note, back, qty })
      this.open = true
    },
    setQty(id: string, qty: number) {
      const line = this.lines.find(l => l.id === id)
      if (!line) return
      if (qty <= 0) this.lines = this.lines.filter(l => l.id !== id)
      else line.qty = Math.min(qty, 20)
    },
    clear() { this.lines = [] },
  },
})
