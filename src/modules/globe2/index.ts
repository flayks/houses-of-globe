// @ts-nocheck
import { Renderer, Camera, Vec3, Orbit, Sphere, Transform, Program, Mesh, Texture } from 'ogl'
import SunCalc from 'suncalc'
import { map } from '$utils/functions/index'
// Shaders
import VERTEX_SHADER from '$modules/globe2/vertex.glsl?raw'
import FRAGMENT_SHADER from '$modules/globe2/frag.glsl?raw'


export class Globe {
    constructor (options: Options) {
        // Options
        this.options = options
        this.el = options.el
        this.parent = options.parent
        this.width = this.el.offsetWidth
        this.height = this.el.offsetHeight
        this.markers = options.markers || []

        // Calculate the current sun position from a given location
        const locations = [
            {
                lat: -37.840935,
                lng: 144.946457,
                tz: 'Australia/Melbourne',
            },
            {
                lat: 48.856614,
                lng: 2.3522219,
                tz: 'Europe/Paris',
            }
        ]

        const location = locations[1]
        const now = new Date()
        const localDate = new Date(now.toLocaleString('en-US', { timeZone: location.tz }))

        this.sunPosition = SunCalc.getPosition(localDate, location.lat, location.lng)

        var times = SunCalc.getTimes(new Date(), location.lat, location.lng);
        var sunrisePos = SunCalc.getPosition(times.sunrise, location.lat, location.lng);
        this.sunriseAzimuth = sunrisePos.azimuth * 180 / Math.PI;

        // Parameters
        this.params = {
            autoRotate: options.autoRotate,
            speed: options.speed,
            enableMarkers: options.enableMarkers,
            zoom: 1.3075,
            sunAngle: options.sunAngle || 0,
            sunAngleDelta: 1.8,
        }

        // Misc
        this.hoveringMarker = false
        this.dragging = false
        this.webgl = WebGLSupport() !== null
        this.pane = undefined

        // Run globe after check for WebGL support
        if (this.webgl) {
            this.build()
            this.resize()
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
        this.camera.position.set(0, 0, this.params.zoom)

        // Create controls
        this.controls = new Orbit(this.camera, {
            element: this.el,
            target: new Vec3(0,0,0),
            enableZoom: false,
            enablePan: false,
            autoRotate: this.options.autoRotate,
            autoRotateSpeed: 0.05,
            ease: 0.2,
            minPolarAngle: Math.PI / 4,
            maxPolarAngle: Math.PI / 1.85,
        })

        // Append canvas to scene
        this.el.appendChild(this.gl.canvas)

        // Create scene and geometry
        this.scene = new Transform()
        this.geometry = new Sphere(this.gl, {
            widthSegments: 64,
            heightSegments: 64,
        })

        // Add map texture
        const mapWorld = new Texture(this.gl)
        const img = new Image()
        img.onload = () => (mapWorld.image = img)
        img.src = this.options.mapFile

        // Dark map texture
        const mapDark = new Texture(this.gl)
        const imgDark = new Image()
        imgDark.onload = () => (mapDark.image = imgDark)
        imgDark.src = this.options.mapFileDark

        const azimuthValue = map(this.sunriseAzimuth, -180, 180, -Math.PI, Math.PI);

        // Create program
        this.program = new Program(this.gl, {
            vertex: VERTEX_SHADER,
            fragment: FRAGMENT_SHADER,
            uniforms: {
                u_dt: { value: 0 },
                map: { value: mapWorld }, // Map Texture
                mapDark: { value: mapDark }, // Map Dark Texture
                altitude: { value: 0 },
                azimuth: { value: 0 },
            },
            cullFace: null,
        })

        // Create light
        this.program.uniforms.altitude.value = this.sunPosition.altitude
        this.program.uniforms.azimuth.value = this.sunPosition.azimuth

        // Create mesh
        this.mesh = new Mesh(this.gl, {
            geometry: this.geometry,
            program: this.program,
        })
        this.mesh.setParent(this.scene)

        // Add events
        this.addEvents()

        // Setup markers
        if (this.options.enableMarkers && this.markers) {
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
            const position = latLonToVec3(marker.lat, marker.lng)
            const screenVector = new Vec3(position.x,position.y,position.z)
            this.camera.project(screenVector)

            // Position marker
            let posX = ((screenVector[0] + 1) / 2) * this.width
            let posY = (1. - (screenVector[1] + 1) / 2) * this.height
            markerEl.style.transform = `translate3d(${posX}px, ${posY}px, 0)`

            // Entering marker
            markerEl.addEventListener('mouseenter', () => {
                this.hoveringMarker = true
            }, false)
            // Leaving marker
            markerEl.addEventListener('mouseleave', () => {
                setTimeout(() => {
                    this.hoveringMarker = false
                }, 200)
            }, false)

            return marker
        })
    }

    // Update markers
    updateMarkers () {
        this.markers.forEach((marker: Marker) => {
            const markerEl = this.getMarker(marker.slug)
            const position = latLonToVec3(marker.lat, marker.lng)

            const screenVector = new Vec3(position.x, position.y, position.z)
            this.camera.project(screenVector)

            const posX = ((screenVector[0] + 1) / 2) * this.width
            const posY = (1. - (screenVector[1] + 1) / 2) * this.height

            markerEl.style.transform = `translate3d(${posX}px, ${posY}px, 0)`
        })
    }


    /**
     * Resize method
     */
    resize () {
        // this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.width = this.el.offsetWidth
        this.height = this.el.offsetHeight
        this.renderer.setSize(this.width, this.height)
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

        // Update controls and renderer
        this.controls.update(this.params)
        this.renderer.render({
            scene: this.scene,
            camera: this.camera,
        })

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
    mapFile: string
    mapFileDark: string
    dpr: number
    autoRotate: boolean
    speed: number
    sunAngle: number
    rotationStart?: number
    enableMarkers?: boolean
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
const latLonToVec3 = (lat: number, lng: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)

    const x = -((0.5) * Math.sin(phi) * Math.cos(theta))
    const z = ((0.5) * Math.sin(phi) * Math.sin(theta))
    const y = ((0.5) * Math.cos(phi))

    return new Vec3(x,y,z)
}

/**
 * Convert Degrees to Radians
 */
const degToRad = (deg: number) => deg * Math.PI / 180
