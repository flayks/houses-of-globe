// @ts-nocheck
import { Renderer, Camera, Vec3, Orbit, Sphere, Transform, Program, Mesh, Texture } from 'ogl'
// Shaders
import VERTEX_SHADER from '../../modules/globe2/vertex.glsl?raw'
import FRAGMENT_SHADER from '../../modules/globe2/frag.glsl?raw'


export class Globe {
    constructor (options: Options) {
        // Options
        this.options = options
        this.el = options.el
        this.parent = options.parent
        this.markers = options.markers || []

        // Parameters
        this.params = {
            autoRotate: options.autoRotate,
            speed: options.speed,
        }

        // Misc
        this.hoveringMarker = false
        this.dragging = false
        this.webgl = WebGLSupport() !== null
        this.pane = undefined

        // Run globe after check for WebGL support
        if (this.webgl) {
            this.build()
            this.resize({
                width: this.options.width,
                height: this.options.height,
            })
            this.render()
        }

        // Add GUI panel if activated
        if (this.options.pane) {
            import('./pane').then(({ createPane }) => {
                createPane(this)
            })
        }
    }


    /**
     * Build scene
     */
    build () {
        // Create renderer
        this.renderer = new Renderer({
            dpr: this.options.dpr || 1,
            alpha: true,
            premultiplyAlpha: false,
            antialias: this.options.antialias || true,
        })
        this.gl = this.renderer.gl

        // Create camera
        this.camera = new Camera(this.gl)
        this.camera.position.set(0, 0, 1.315)

        // Create controls
        this.controls = new Orbit(this.camera, {
            element: this.el,
            target: new Vec3(0,0,0),
            enableZoom: false,
            enablePan: false,
            autoRotate: false,
            ease: 0.2,
            minPolarAngle: Math.PI / 4,
            maxPolarAngle: Math.PI / 1.5,
        })

        // Append canvas to scene
        this.el.appendChild(this.gl.canvas)

        // Create scene and geometry
        this.scene = new Transform()
        this.geometry = new Sphere(this.gl, {
            widthSegments: 64,
            heightSegments: 64,
        })

        // Create light
        // this.light = new Vec3(0, 50, 150)
        this.light = new Vec3(0, 0, 1000)

        // Add map texture
        const map = new Texture(this.gl)
        const img = new Image()
        img.onload = () => (map.image = img)
        img.src = this.options.mapFile

        // Create program
        this.program = new Program(this.gl, {
            vertex: VERTEX_SHADER,
            fragment: FRAGMENT_SHADER,
            uniforms: {
                u_dt: { value: 0 },
                u_lightWorldPosition: { value: this.light }, // Position of the Light
                u_shininess: { value: 1.0 },
                map: { value: map }, // Color Map
            },
            transparent: true,
        })

        // Create mesh
        this.mesh = new Mesh(this.gl, {
            geometry: this.geometry,
            program: this.program,
        })
        this.mesh.setParent(this.scene)

        // Define random continent position
        if (this.options.rotationStart) {
            this.mesh.rotation.y = degToRad(this.options.rotationStart * -1) || 0
        }

        // Add events
        this.addEvents()

        // Setup markers
        if (this.markers) {
            this.setupMarkers()
        }
    }


    /**
     * Add events
     */
    addEvents () {
        // When clicking on globe
        this.gl.canvas.addEventListener('mousedown', () => {
            this.dragging = true
            this.gl.canvas.classList.add('is-grabbing')
        }, false)

        // When releasing globe click
        this.gl.canvas.addEventListener('mouseup', () => {
            this.dragging = false
            this.gl.canvas.classList.remove('is-grabbing')
        }, false)
    }


    /**
     * Markers
     */
    // Get marker from DOM element
    getMarker (id: string) {
        const marker = this.parent.querySelector(`[data-location="${id}"]`)
        if (marker) {
            return marker
        }
    }

    // Setup markers
    setupMarkers () {
        this.markers.forEach((marker: Marker) => {
            const markerEl = this.getMarker(marker.slug)

            // Entering marker
            markerEl.addEventListener('mouseenter', () => {
                this.hoveringMarker = true
            }, false)
            // Leaving marker
            markerEl.addEventListener('mouseleave', () => {
                this.hoveringMarker = false
            }, false)

            // Define position
            const position = lonlatVec3(marker.lng, marker.lat)

            // Scale marker position to fit globe size
            marker.position = [position[0] *= 0.5, position[1] *= 0.5, position[2] *= 0.5]

            console.log(marker)
            return marker
        })
    }

    // Update markers
    updateMarkers () {
        this.markers.forEach((marker: Marker) => {
            const markerEl = this.getMarker(marker.slug)
            const screenVector = new Vec3(0,0,0)
            screenVector.copy(marker.position)
            this.camera.project(screenVector)

            // let posX = (screenVector.x + 1) * (this.options.width / 1.315)
            // // posX /= this.mesh.rotation.y
            // let posY = (1 - screenVector.y) * (this.options.height / 1.315)
            // markerEl.style.transform = `translate3d(${posX}px, ${posY}px, 0)`
        })
    }


    /**
     * Resize method
     */
    resize (options: any) {
        // this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.setSize(options.width || this.options.width, options.height || this.options.height)
        this.camera.perspective({
            aspect: this.gl.canvas.width / this.gl.canvas.height
        })
    }


    /**
     * Update method
     */
    render () {
        // Stop render if not dragging but hovering marker
        if (!this.dragging && this.hoveringMarker) return

        // Update globe rotation
        if (this.params.autoRotate) {
            this.mesh.rotation.y += this.params.speed
        }

        // Update controls and renderer
        this.controls.update(this.params)
        this.renderer.render({
            scene: this.scene,
            camera: this.camera,
        })

        // Update light
        // this.light.set(this.camera.position)
        // this.program.uniforms.u_lightWorldPosition.value = [this.mesh.rotation.y * 1, 50, 150]

        // Update markers
        this.updateMarkers()
    }


    /**
     * Destroy
     */
    destroy () {
        console.log('destroy globe2')

        this.gl = null
        this.scene = null
        this.camera = null
        this.mesh = null
        this.renderer = null
        this.controls.remove()

        if (this.pane) {
            this.pane.dispose()
        }
    }
}


/**
 * Types
 */
type Options = {
    el: HTMLElement
    parent: HTMLElement
    width: number
    height: number
    mapFile: string
    dpr: number
    autoRotate: boolean
    speed: number
    rotationStart?: number
    markers?: any[]
    pane?: boolean
}
export type Marker = {
    name: string
    slug: string
    country: {
        name: string
        slug: string
        flag: {
            id: string
        }
    }
    lat: number
    lng: number
    position?: number[]
}


/* ==========================================================================
   HELPERS
========================================================================== */
/**
 * Detect WebGL support
 */
function WebGLSupport () {
    try {
        var canvas = document.createElement('canvas')
        return !!window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    } catch(e) {
        return false
    }
}

/**
 * Convert lat/lng to Vec3
 */
function lonlatVec3 (longitude: number, latitude: number) {
    const lat = latitude * Math.PI / 180
    const lng = -longitude * Math.PI / 180
    return new Vec3(
        Math.cos(lat) * Math.cos(lng),
        Math.sin(lat),
        Math.cos(lat) * Math.sin(lng)
    )
}

/**
 * Convert Degrees to Radians
 */
const degToRad = (deg: number) => deg * Math.PI / 180