// Procedural 3D bowl for boop: lathe-built shell with fine layer lines, a scoop that pours,
// a polished steel insert, instanced kibble that pours in, and a name that is
// engraved into the shell (canvas bump + colour map). Client-only.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export type ShapeId = 'wave' | 'rings' | 'raised'

interface Shape {
  /** Outer profile (radius, height), bottom centre to inner rim. */
  profile: [number, number][]
  /** Height of the steel insert's rim. */
  rim: number
  /** Height (on the outer wall) where the name is centred, and letter height. */
  nameY: number
  nameSize: number
  /** Radius at the name, used to keep letters in proportion. */
  nameR: number
  /** Two-tone wave line height on the outer wall (null = single colour). */
  waveY: number | null
}

const SHAPES: Record<ShapeId, Shape> = {
  wave: {
    profile: [[0, 0], [0.6, 0], [0.93, 0.02], [1.07, 0.12], [1.13, 0.3], [1.11, 0.48], [1.04, 0.62], [0.96, 0.7], [0.87, 0.72], [0.82, 0.66]],
    rim: 0.69, nameY: 0.47, nameSize: 0.15, nameR: 1.1, waveY: 0.29,
  },
  rings: {
    profile: [[0, 0], [0.7, 0], [0.98, 0.02], [1.1, 0.12], [1.04, 0.24], [1.12, 0.36], [1.04, 0.48], [1.12, 0.6], [1.04, 0.72], [1.1, 0.84], [1.0, 0.95], [0.87, 0.97], [0.82, 0.9]],
    rim: 0.94, nameY: 0.6, nameSize: 0.12, nameR: 1.12, waveY: null,
  },
  raised: {
    profile: [[0, 0], [0.8, 0], [1.12, 0.01], [1.17, 0.06], [1.08, 0.5], [0.99, 0.95], [0.95, 1.02], [0.87, 1.03], [0.82, 0.97]],
    rim: 1.0, nameY: 0.7, nameSize: 0.17, nameR: 1.02, waveY: 0.42,
  },
}

const ease = (t: number) => t * t * (3 - 2 * t)
// Scoop rest position (relative to the bowl centre) and pour angle; LIP = where its rim
// edge ends up when tilted, i.e. where the kibble leaves it.
const SCOOP_X = 0.62, SCOOP_Y = 1.45, SCOOP_Z = 0.2, SCOOP_TILT = 1.75
const LIP = (() => {
  const x = -0.42, y = 0.44, c = Math.cos(SCOOP_TILT), s = Math.sin(SCOOP_TILT)
  return { x: SCOOP_X + x * c - y * s, y: SCOOP_Y + x * s + y * c, z: SCOOP_Z }
})()
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/** [top, bottom] colours; bottom is used below the wave line on two-tone shapes. */
export type Colours = [string, string]
export interface BowlOptions { colours: Colours; name: string; shape: ShapeId; kibble?: number }

export class BowlScene {
  renderer: THREE.WebGLRenderer
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50)
  group = new THREE.Group()
  private shell!: THREE.Mesh
  private insert!: THREE.Mesh
  private kibble!: THREE.InstancedMesh
  /** The scoop that pours the kibble in (follows the bowl, not its spin). */
  private scoop = new THREE.Group()
  private scoopBand!: THREE.MeshPhysicalMaterial
  private scoopCream!: THREE.MeshPhysicalMaterial
  private scoopMound!: THREE.InstancedMesh
  private shellMat: THREE.MeshPhysicalMaterial
  private canvas = document.createElement('canvas')
  private bumpCanvas = document.createElement('canvas')
  private mapTex: THREE.CanvasTexture
  private bumpTex: THREE.CanvasTexture
  private rest: THREE.Vector3[] = []
  private start: THREE.Vector3[] = []
  private spin: THREE.Euler[] = []
  private scale: number[] = []
  private shape: Shape
  private opts: BowlOptions
  private dummy = new THREE.Object3D()
  /** 0..1 how much kibble has fallen; 0..1 how much of the name is engraved. */
  pour = 1
  engrave = 1
  rotation = 0
  /** Horizontal offset of the bowl on wide screens. */
  offsetX = 0.85
  private raf = 0
  private visible = true
  private dirty = true
  private ro: ResizeObserver

  constructor(private host: HTMLElement, opts: BowlOptions) {
    this.opts = { kibble: 320, ...opts }
    this.shape = SHAPES[opts.shape]
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    host.appendChild(this.renderer.domElement)

    const pmrem = new THREE.PMREMGenerator(this.renderer)
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    this.scene.environmentIntensity = 0.55

    // Warm late-afternoon sun from the upper left, like the product photos.
    const sun = new THREE.DirectionalLight(0xffd9a8, 2.6)
    sun.position.set(-3, 5, 3)
    sun.castShadow = true
    sun.shadow.mapSize.set(1024, 1024)
    sun.shadow.camera.left = -2; sun.shadow.camera.right = 2; sun.shadow.camera.top = 2; sun.shadow.camera.bottom = -2
    sun.shadow.radius = 6
    sun.shadow.bias = -0.0015
    this.scene.add(sun, new THREE.HemisphereLight(0xfff1de, 0x8a5a3c, 0.55))

    // Soft contact shadow on the floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.22 }))
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    this.scene.add(floor)
    const blob = document.createElement('canvas'); blob.width = blob.height = 128
    const bctx = blob.getContext('2d')!
    const g = bctx.createRadialGradient(64, 64, 10, 64, 64, 64)
    g.addColorStop(0, 'rgba(60,35,15,.45)'); g.addColorStop(1, 'rgba(60,35,15,0)')
    bctx.fillStyle = g; bctx.fillRect(0, 0, 128, 128)
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(blob), transparent: true, depthWrite: false }))
    contact.rotation.x = -Math.PI / 2; contact.position.y = 0.002
    this.scene.add(contact)

    // Shell textures: colour map (engraving shade) + bump map (layer lines + engraving)
    this.canvas.width = this.bumpCanvas.width = 2048
    this.canvas.height = this.bumpCanvas.height = 1024
    this.mapTex = new THREE.CanvasTexture(this.canvas)
    this.mapTex.colorSpace = THREE.SRGBColorSpace
    this.bumpTex = new THREE.CanvasTexture(this.bumpCanvas)
    for (const t of [this.mapTex, this.bumpTex]) { t.anisotropy = 8; t.wrapS = THREE.RepeatWrapping }
    this.shellMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff', roughness: 0.78, sheen: 0.35, sheenRoughness: 0.8, sheenColor: new THREE.Color('#ffffff'),
      map: this.mapTex, bumpMap: this.bumpTex, bumpScale: 3,
    })

    this.scene.add(this.group)
    this.buildBowl()
    this.buildKibble()
    this.buildScoop()
    this.drawSurface()

    this.camera.position.set(0, 2.2, 5)
    this.camera.lookAt(0, 0.45, 0)

    this.ro = new ResizeObserver(() => this.resize())
    this.ro.observe(host)
    this.resize()
    this.loop()
  }

  private profilePoints() {
    const pts = this.shape.profile.map(([r, y]) => new THREE.Vector2(r, y))
    return new THREE.SplineCurve(pts).getSpacedPoints(160)
  }

  private buildBowl() {
    if (this.shell) { this.group.remove(this.shell, this.insert); this.shell.geometry.dispose(); this.insert.geometry.dispose() }
    // phiStart = PI so texture u = 0.5 faces the camera (+z): the name sits front and centre.
    const shellGeo = new THREE.LatheGeometry(this.profilePoints(), 160, Math.PI)
    this.shell = new THREE.Mesh(shellGeo, this.shellMat)
    this.shell.castShadow = true; this.shell.receiveShadow = true

    const top = this.shape.rim
    const ins = [[0, top - 0.5], [0.5, top - 0.5], [0.64, top - 0.44], [0.74, top - 0.25], [0.81, top - 0.04], [0.86, top], [0.88, top - 0.012]]
      .map(([r, y]) => new THREE.Vector2(r!, y!))
    const insGeo = new THREE.LatheGeometry(new THREE.SplineCurve(ins).getSpacedPoints(60), 96)
    const steel = new THREE.MeshPhysicalMaterial({ color: '#d9dcdf', metalness: 1, roughness: 0.22, side: THREE.DoubleSide, envMapIntensity: 1.6, clearcoat: 0.4 })
    this.insert = new THREE.Mesh(insGeo, steel)
    this.insert.receiveShadow = true
    this.group.add(this.shell, this.insert)
  }

  private buildKibble() {
    if (this.kibble) { this.group.remove(this.kibble); this.kibble.geometry.dispose() }
    const n = this.opts.kibble!
    const geo = new THREE.IcosahedronGeometry(0.06, 2)
    const pos = geo.attributes.position as THREE.BufferAttribute
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) { // lumpy, baked-looking pellets
      v.fromBufferAttribute(pos, i)
      const k = 1 + 0.12 * Math.sin(v.x * 70) * Math.cos(v.y * 60) + 0.06 * Math.sin(v.z * 90)
      v.multiplyScalar(k); v.y *= 0.72
      pos.setXYZ(i, v.x, v.y, v.z)
    }
    geo.computeVertexNormals()
    const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85, bumpScale: 0.6 })
    this.kibble = new THREE.InstancedMesh(geo, mat, n)
    this.kibble.castShadow = true; this.kibble.receiveShadow = true
    const browns = ['#6b3a1a', '#7a4420', '#5c3015', '#8a5026', '#4f2a12'].map(c => new THREE.Color(c))

    // Rest positions: a mound inside the insert, sorted bottom-up so it fills naturally.
    const top = this.shape.rim, floorY = top - 0.47
    const rnd = mulberry(7)
    const rest: THREE.Vector3[] = []
    for (let i = 0; i < n; i++) {
      const h = Math.pow(rnd(), 0.8) * 0.42
      const y = floorY + h
      const rMax = 0.5 + (0.78 - 0.5) * (h / 0.47) - 0.06
      const mound = 1 - (y - floorY) / 0.52
      const r = Math.sqrt(rnd()) * rMax * Math.max(0.35, mound + 0.4)
      const a = rnd() * Math.PI * 2
      rest.push(new THREE.Vector3(Math.cos(a) * r, y + (0.08 - r * 0.1) * (h / 0.42), Math.sin(a) * r))
    }
    rest.sort((a, b) => a.y - b.y)
    this.rest = rest
    this.start = rest.map(() => new THREE.Vector3((rnd() - 0.5) * 0.12, rnd() * 0.08, (rnd() - 0.5) * 0.14)) // jitter around the scoop lip
    this.spin = rest.map(() => new THREE.Euler(rnd() * 6, rnd() * 6, rnd() * 6))
    this.scale = rest.map(() => 0.8 + rnd() * 0.45)
    for (let i = 0; i < n; i++) this.kibble.setColorAt(i, browns[i % browns.length]!)
    this.group.add(this.kibble)
    this.updateKibble()
  }

  private buildScoop() {
    const mat = (c: string) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.78, sheen: 0.3, sheenRoughness: 0.8, side: THREE.DoubleSide })
    this.scoopCream = mat(this.opts.colours[0]); this.scoopBand = mat(this.opts.colours[1])
    // cup: about half the bowl's width, closed bottom, rounded lip
    const prof = [[0, 0], [0.36, 0], [0.42, 0.05], [0.43, 0.42], [0.415, 0.44], [0.395, 0.42], [0.385, 0.08], [0.33, 0.035], [0, 0.035]]
      .map(([r, y]) => new THREE.Vector2(r!, y!))
    const cup = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), this.scoopCream)
    // two-tone ribbed band at the bottom, like the bowls
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.436, 0.426, 0.19, 72, 1, true), this.scoopBand)
    band.position.y = 0.1
    // flat handle with a rounded end, leaving the rim on the +x side
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.05, 0.17), this.scoopCream)
    handle.position.set(0.41 + 0.41, 0.405, 0)
    const end = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 32), this.scoopCream)
    end.position.set(0.41 + 0.82, 0.405, 0)
    // kibble heaped in the cup; it empties as the pour goes on
    const n = 34
    this.scoopMound = new THREE.InstancedMesh(this.kibble.geometry, this.kibble.material as THREE.Material, n)
    const rnd = mulberry(11)
    const browns = ['#6b3a1a', '#7a4420', '#5c3015', '#8a5026'].map(c => new THREE.Color(c))
    for (let i = 0; i < n; i++) {
      const r = Math.sqrt(rnd()) * 0.3, a = rnd() * Math.PI * 2
      this.dummy.position.set(Math.cos(a) * r, 0.3 + rnd() * 0.12 + (0.3 - r) * 0.25, Math.sin(a) * r)
      this.dummy.rotation.set(rnd() * 6, rnd() * 6, rnd() * 6); this.dummy.scale.setScalar(0.8 + rnd() * 0.4)
      this.dummy.updateMatrix(); this.scoopMound.setMatrixAt(i, this.dummy.matrix); this.scoopMound.setColorAt(i, browns[i % browns.length]!)
    }
    for (const m of [cup, band, handle, end]) { m.castShadow = true; m.receiveShadow = true }
    this.scoop.add(cup, band, handle, end, this.scoopMound)
    this.scene.add(this.scoop)
    this.updateScoop()
  }

  /** Scoop pose for the current pour/engrave progress. */
  private updateScoop() {
    const inK = ease(clamp(this.pour / 0.12))
    const tilt = ease(clamp((this.pour - 0.06) / 0.2)) * SCOOP_TILT
    const outK = ease(clamp(this.engrave / 0.6))
    const g = this.group.position
    this.scoop.visible = this.pour > 0.001 && outK < 0.999
    this.scoop.position.set(g.x + SCOOP_X + (1 - inK) * 2.4 + outK * 2.6, g.y + SCOOP_Y + (1 - inK) * 0.4 + outK * 1.0, SCOOP_Z)
    this.scoop.rotation.set(0, 0, tilt)
    // the heap empties while the kibble falls
    const n = this.scoopMound.count
    for (let i = 0; i < n; i++) {
      this.scoopMound.getMatrixAt(i, this.dummy.matrix)
      this.dummy.matrix.decompose(this.dummy.position, this.dummy.quaternion, this.dummy.scale)
      const keep = this.pour < 0.14 + (1 - i / n) * 0.6
      this.dummy.scale.setScalar(keep ? 0.8 + (i % 5) * 0.09 : 0)
      this.dummy.updateMatrix(); this.scoopMound.setMatrixAt(i, this.dummy.matrix)
    }
    this.scoopMound.instanceMatrix.needsUpdate = true
  }

  private updateKibble() {
    const n = this.rest.length
    for (let i = 0; i < n; i++) {
      const delay = 0.18 + (i / n) * 0.62
      const t = clamp((this.pour - delay) / 0.2)
      const d = this.dummy
      if (t <= 0) { d.scale.setScalar(0); d.position.set(0, -10, 0) }
      else {
        // start at the scoop lip (world), expressed in the spinning bowl's local frame
        const j = this.start[i]!, r = this.rest[i]!
        const wx = LIP.x + j.x, wz = LIP.z + j.z, cos = Math.cos(-this.group.rotation.y), sin = Math.sin(-this.group.rotation.y)
        const s = new THREE.Vector3(wx * cos + wz * sin, LIP.y + j.y, -wx * sin + wz * cos)
        const fall = t * t // gravity
        const bounce = t > 0.86 ? Math.sin((t - 0.86) / 0.14 * Math.PI) * 0.05 : 0
        d.position.set(s.x + (r.x - s.x) * ease(t), s.y + (r.y - s.y) * fall + bounce, s.z + (r.z - s.z) * ease(t))
        const e = this.spin[i]!
        d.rotation.set(e.x * (1 - t * 0.6), e.y + t * 4 * (1 - t), e.z)
        d.scale.setScalar(this.scale[i]!)
      }
      d.updateMatrix()
      this.kibble.setMatrixAt(i, d.matrix)
    }
    this.kibble.instanceMatrix.needsUpdate = true
  }

  /** Texture v (0..1 along the profile) at a given height on the outer wall. */
  private vAt(y: number) {
    const pts = this.profilePoints()
    const cum = [0]
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1]! + pts[i]!.distanceTo(pts[i - 1]!))
    const L = cum[cum.length - 1]!
    let i = pts.findIndex((p, k) => k > 0 && p.x > 0.5 && p.y >= y)
    if (i < 1) i = 1
    const a = pts[i - 1]!, b = pts[i]!
    const f = b.y === a.y ? 0 : (y - a.y) / (b.y - a.y)
    return { v: (cum[i - 1]! + f * (cum[i]! - cum[i - 1]!)) / L, L }
  }

  /** Colours, 3D-print layer lines, ribs below the wave, and the engraved name. */
  private drawSurface() {
    const W = 2048, H = 1024
    const m = this.canvas.getContext('2d')!, b = this.bumpCanvas.getContext('2d')!
    const [top, bottom] = this.opts.colours
    const cy = (v: number) => (1 - v) * H
    m.fillStyle = top; m.fillRect(0, 0, W, H)
    b.fillStyle = '#808080'; b.fillRect(0, 0, W, H)

    const wave = this.shape.waveY
    if (wave !== null) {
      // soft wave line, three periods around so it tiles seamlessly
      const line = (x: number) => cy(this.vAt(wave + 0.055 * Math.sin((x / W) * Math.PI * 2 * 3)).v)
      for (const [ctx, fill] of [[m, bottom], [b, '#7a7a7a']] as const) {
        ctx.beginPath(); ctx.moveTo(0, H)
        for (let x = 0; x <= W; x += 8) ctx.lineTo(x, line(x))
        ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = fill; ctx.fill()
      }
      // vertical ribs on the darker part
      b.save()
      b.beginPath(); b.moveTo(0, H); for (let x = 0; x <= W; x += 8) b.lineTo(x, line(x)); b.lineTo(W, H); b.closePath(); b.clip()
      for (let x = 0; x < W; x += 22) {
        const g = b.createLinearGradient(x, 0, x + 22, 0)
        g.addColorStop(0, 'rgba(0,0,0,.6)'); g.addColorStop(.5, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(0,0,0,.6)')
        b.fillStyle = g; b.fillRect(x, 0, 22, H)
      }
      b.restore()
    }
    // 3D-print layer lines: fine horizontal ridges everywhere
    for (let y = 0; y < H; y += 4) { b.fillStyle = 'rgba(255,255,255,.18)'; b.fillRect(0, y, W, 2) }

    const name = (this.opts.name || '').toUpperCase().slice(0, 10)
    const shown = name.slice(0, Math.round(name.length * clamp(this.engrave)))
    if (shown) {
      const { v, L } = this.vAt(this.shape.nameY)
      const hPx = W / (2 * Math.PI * this.shape.nameR), vPx = H / L
      const size = this.shape.nameSize * vPx * (name.length > 6 ? 6 / name.length : 1)
      const shade = new THREE.Color(top).multiplyScalar(0.55).getStyle()
      for (const [ctx, fill, blur] of [[m, shade, 0], [b, '#101010', size * 0.03]] as const) {
        ctx.save()
        ctx.translate(W / 2, cy(v))
        ctx.scale(hPx / vPx, 1)
        ctx.font = `600 ${size}px "Jost Variable", Jost, system-ui, sans-serif`
        ctx.letterSpacing = `${Math.round(size * 0.14)}px`
        ctx.textBaseline = 'middle'
        ctx.textAlign = 'left'
        const full = ctx.measureText(name).width
        ctx.filter = blur ? `blur(${blur}px)` : 'none' // soft walls so the bump reads as a carved groove
        ctx.fillStyle = fill
        ctx.fillText(shown, -full / 2, 0)
        ctx.restore()
      }
    }
    this.mapTex.needsUpdate = true
    this.bumpTex.needsUpdate = true
    this.dirty = true
  }

  set({ colours, name, shape }: Partial<BowlOptions>) {
    if (colours) { this.opts.colours = colours; this.scoopCream?.color.set(colours[0]); this.scoopBand?.color.set(colours[1]) }
    if (name !== undefined) this.opts.name = name
    if (shape && shape !== this.opts.shape) {
      this.opts.shape = shape; this.shape = SHAPES[shape]
      this.buildBowl(); this.buildKibble()
    }
    this.drawSurface()
  }

  setProgress(pour: number, engrave: number, rotation: number, cam = 0) {
    const nameChanged = Math.round((this.opts.name || '').length * clamp(engrave)) !== Math.round((this.opts.name || '').length * clamp(this.engrave))
    this.pour = pour; this.engrave = engrave; this.rotation = rotation
    this.updateKibble()
    this.updateScoop()
    if (nameChanged) this.drawSurface()
    // camera glides closer and lower as the bowl fills
    const k = ease(clamp(cam))
    this.camera.position.set(0, 3.1 - k * 1.25, 6.6 - k * 1.7)
    this.camera.lookAt(this.group.position.x * 0.35, 0.5 + this.group.position.y * 0.5, 0)
    this.dirty = true
  }

  setVisible(v: boolean) { this.visible = v }

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.host
    if (!w || !h) return
    this.renderer.setSize(w, h, false)
    this.camera.aspect = w / h
    // keep the bowl framed on narrow screens
    this.camera.fov = w / h < 0.8 ? 46 : 32
    // leave room for copy: bowl sits right on wide screens, lower on tall ones
    this.group.position.x = w / h > 1.15 ? this.offsetX : 0
    this.group.position.y = w / h < 0.8 ? -0.35 : 0
    this.camera.updateProjectionMatrix()
    this.updateScoop()
    this.dirty = true
  }

  private loop = () => {
    this.raf = requestAnimationFrame(this.loop)
    if (!this.visible) return
    const target = this.rotation
    const cur = this.group.rotation.y
    if (Math.abs(target - cur) > 0.0005) { this.group.rotation.y += (target - cur) * 0.12; if (this.pour > 0 && this.pour < 1) this.updateKibble(); this.dirty = true }
    if (this.dirty) { this.renderer.render(this.scene, this.camera); this.dirty = false }
  }

  dispose() {
    cancelAnimationFrame(this.raf)
    this.ro.disconnect()
    this.renderer.dispose()
    this.renderer.domElement.remove()
    this.scene.traverse(o => {
      const mesh = o as THREE.Mesh
      mesh.geometry?.dispose?.()
      const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach(x => x.dispose()); else mat?.dispose?.()
    })
  }
}

function mulberry(a: number) {
  return () => { a |= 0; a = a + 0x6d2b79f5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
}
