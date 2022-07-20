import { Renderer } from './beam'
import { Camera } from './beam'
import { vec2, vec3, mat4 } from './beam'
import { Container, Mesh, Material, Texture, SphereGeometryBuffer, PlaneGeometryBuffer } from './beam'

// GLSL shaders as strings
import GlobeVS from './globe-vs.glsl?raw'
import GlobeFS from './globe-fs.glsl?raw'

const FOV = 1 // Camera Field of view; we use 1 to prevent strong perspective effect on the globe

/** get 3D position on a sphere from longitute lattitude */
const lonLatToVector3 = (lng, lat) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    const x = -(Math.sin(phi) * Math.cos(theta))
    const z = Math.sin(phi) * Math.sin(theta)
    const y = Math.cos(phi)
    return [x,y,z]
}

// Convert degrees to radians
const degToRad = deg => deg * Math.PI / 180


class WebglGlobe {
    // Constructor
    constructor (options) {
        this.$el                       = options.el // The DOM reference node
        this.options                   = options
        this.options.autoRotationSpeed = this.options.autoRotationSpeed || 0
        this.options.scrollSmoothing   = this.options.scrollSmoothing   || 0.5 // Smooth the globe position to avoid janks on scroll (lower == smoother)
        this.options.cameraDistance    = 1 // this.options.cameraDistance    || 1 // A multiplier to move camera backward or forward
        this.options.opacity           = this.options.opacity || 1

        this.locations                 = options.markers // List of locations with their options
        this._canUpdate                = false
        this.hasUpdateCameraPos        = false
        this.referenceHeight           = 1 // Used to set camera distance from globe where referenceHeight == window height
        this.currMarkerScrollOffset    = 0
        this.markersScrollOffset       = 0
        this.globeScrollOffset         = 0
        this.globeAutoRotation         = degToRad(this.options.rotationStart * -1) || 0
        this._isHoverMarker            = false

        let gl
        const canvas = document.createElement('canvas')

        try {
            gl = canvas.getContext('webgl')
        } catch (x) {
            try {
                gl = canvas.getContext('experimental-webgl')
            } catch (x) {
                gl = null
            }
        }

        this.supportWebgl = gl !== null
        if (this.supportWebgl) {
            this.buildWebglScene()
            this.resize()
        }
    }


    /**
     * Build scene
     */
    buildWebglScene () {
        // Renderer
        this.renderer = new Renderer({
            // To allow transparent background on webgl canvas
            alpha: true,
            // Enable antialiasing only if screen is small with no retina (for performances reasons)
            antialias: window.innerWidth < 768 || window.devicePixelRatio == 1 ? true : false,
        })

        const elParent = document.body

        // we put the canvas at the end of body tag as 'position:fixed'
        // this is to avoid having a too big canvas if the globe needs to be very large:
        // so instead we move the globe as we scroll
        this.renderer.canvas.classList.add('globe-canvas')
        this.renderer.canvas.style.position = 'fixed'
        this.renderer.canvas.style.top  = 0
        this.renderer.canvas.style.left = 0
        this.renderer.canvas.style.pointerEvents = 'none'
        // this.renderer.canvas.style.zIndex = 100
        elParent.appendChild(this.renderer.canvas)

        // The markers DOM nodes wrapper
        // this wrapper is added just next to the canvas, at the end of body tag
        this.$markerWrapper = document.createElement('div')
        this.$markerWrapper.classList.add('globe-markers')
        this.$markerWrapper.style.position = 'fixed'
        this.$markerWrapper.style.top  = 0
        this.$markerWrapper.style.left = 0
        this.$markerWrapper.style.pointerEvents = 'none'
        elParent.appendChild(this.$markerWrapper)

        // Load worldmap texture
        this.texture = Texture.fromUrl(this.renderer.gl, this.options.texture, {
            loaded: () => {
                //TODO: use only one RAF if possible
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.imageLoaded = true
                    })
                })
            }
        })

        this.scene = new Container()

        /**
         * Setup camera
         */
        this.camera = new Camera({
            fov:           1,
            near:          0.1,
            far:           1000,
            type:          'perspective',
            orbitControl:  true,
            firstPerson:   false,
            lookAt:        [0,0,0],
            position:      [0,0,0],
            pointerParent: this.$el
        })
        this.camera.lookAt = vec3.create()

        /**
         * used to compute screen position of markers,
         * to move the corresponding DOM nodes
         */
        this.viewProjectionMatrix = mat4.create()
        this.cameraPosition = vec3.create()

        this.globeMesh = new Mesh()
        this.globeMesh.material = new Material(this.renderer.gl, {
            uniforms: {
                tInput: this.texture,
                uCameraOffsetY: 0,
            },
            vertexShader:   GlobeVS,
            fragmentShader: GlobeFS,
        })
        this.globeMesh.geometry = new SphereGeometryBuffer(this.renderer.gl, {
            radius: this.referenceHeight / 2,
            widthSegments: 100, heightSegments: 100
        })
        this.scene.add(this.globeMesh)


        // this.refPlane = new Mesh()
        // this.refPlane.material = new Material(this.renderer.gl, {
        //     uniforms: {
        //         color: [0,1,0]
        //     }
        // })
        // this.refPlane.geometry = new PlaneGeometryBuffer(this.renderer.gl, {
        //     width: this.referenceHeight, height: this.referenceHeight
        // })
        // this.scene.add(this.refPlane)


        /**
         * Add drag and touch event listeners
         */
        const addDragingClass = () => this.$el.classList.add('is-dragging')
        const removeDragingClass = () => this.$el.classList.remove('is-dragging')
        this.$el.addEventListener('dragstart', addDragingClass)
        this.$el.addEventListener('dragend', removeDragingClass)


        /**
         * Create DOM nodes for markers and 3D positions
         */
        this.markers = []
        let markers  = this.locations

        // Instance all markers
        for (let i = 0; i < markers.length; i++) {
            // Position marker
            let p = lonLatToVector3(markers[i].lng, markers[i].lat)

            // Scale marker position to fit globe size
            p[0] *= this.referenceHeight / 2
            p[1] *= this.referenceHeight / 2
            p[2] *= this.referenceHeight / 2

            // Wrap marker in link
            let el = document.createElement('a')
            el.style.pointerEvents = 'auto'
            el.setAttribute('href', `/${markers[i].countrySlug}/${markers[i].slug}`)
            el.setAttribute('sveltekit-noscroll', '')
            if (markers[i].className) el.classList.add(markers[i].className)

            // Add label
            let span = document.createElement('span')
            span.classList.add('marker__label')
            el.appendChild(span)

            // Add city label
            let spanCity = document.createElement('span')
            spanCity.classList.add('marker__city')
            spanCity.innerHTML = markers[i].name
            span.appendChild(spanCity)

            // Add country label
            let spanCountry = document.createElement('span')
            spanCountry.classList.add('marker__country')
            spanCountry.innerHTML = markers[i].countryName
            span.appendChild(spanCountry)

            // Add class
            el.classList.add('marker')

            // Add a class if opacity is below 1
            if (this.options.opacity < 1) {
                el.classList.add('is-light')
            }

            // Callback on click
            el.addEventListener('click', () => {
                this.options.onLinkClicked && this.options.onLinkClicked()
            })

            // Add class on hover
            el.addEventListener('mouseenter', () => {
                el.classList.add('hover')
                // Stop globe rotation
                this._isHoverMarker = true
                // Clear timeout to be sure
                clearTimeout(this.hoverTimeout)
            })
            el.addEventListener('mouseleave', () => {
                // Restart rotation after a little delay
                this.hoverTimeout = setTimeout(() => this._isHoverMarker = false, 400)
            })
            el.addEventListener('animationend', () => {
                el.classList.remove('hover')
            })

            // Append marker to HTML
            this.$markerWrapper.appendChild(el)

            this.markers.push({
                el: el,
                position: p,
                screenPosition: [0,0]
            })
        }
    }


    /**
     * Resize method
     */
    resize () {
        if (!this.supportWebgl) {
            return
        }

        this.width  = window ? window.innerWidth : 0
        this.height = window ? window.innerHeight : 0

        //fit globe to container height
        this.options.cameraDistance = this.height / this.$el.clientHeight;

        // Remove retina on small screen (aka mobile) to boost perfs
        this.renderer.setPixelRatio(window.innerWidth < 768 ? 1 : window.devicePixelRatio)
        this.renderer.resize(this.width, this.height)

        // Update camera aspect ratio
        this.camera.aspect = this.width / this.height
        this.camera.updateProjectionMatrix()

        // Distance to put the camera when rotating around the globe
        this.camera._cameraDistance = (this.referenceHeight * this.options.cameraDistance) / 2 / Math.tan(Math.PI * FOV / 360)
        this.camera.update(true)

        /**
         * When markers are behind the globe, clamp their position
         * to this size to make them move along the circle edge
         */
        this.circleScreenSize = (this.height / 2) * (1 / this.options.cameraDistance)
    }


    /**
     * As the camera rotates arount the globe, we cant simply move the Y position of the camera or the globe
     * Instead, we move the globe vertex inside the vertex shadder after compute the project on screen, so we pass the 'scroll' position to a uniform
     */
    updateCameraPos (y, scrollDiff) {
        this.globeScrollOffset   = y
        this.markersScrollOffset = scrollDiff

        // Avoid jump due to smoothing when setting it for first time as the inital values are 0
        if (!this.hasUpdateCameraPos) {
            this.hasUpdateCameraPos = true
            if (this.globeMesh.material.uniforms.uCameraOffsetY) {
                this.globeMesh.material.uniforms.uCameraOffsetY.value = this.globeScrollOffset
            }
            this.currMarkerScrollOffset = this.markersScrollOffset
        }
    }


    /**
     * Destroy the globe
     */
    destroy () {
        this.disable() // Stop render loop
        document.body.removeChild(this.$markerWrapper)
        document.body.removeChild(this.renderer.canvas)
        this.camera.delete() // To remove event listeners
    }


    /**
     * Flag to stop rendering the webgl if the globe isnt visible
     * This helps saving perfs and battery
     */
    enable () {
        this.renderer.canvas.style.opacity = this.options.opacity
        this.$markerWrapper.style.opacity = 1
        this._canUpdate = true
    }
    disable () {
        this.renderer.canvas.style.opacity = 0
        this.$markerWrapper.style.opacity = 0
        this._canUpdate = false
    }


    /**
     * Update
     */
    update () {
        if (!this.supportWebgl || !this._canUpdate || !this.imageLoaded || !this.hasUpdateCameraPos) {
            return
        }

        if (this.globeMesh.material.uniforms.uCameraOffsetY) {
            this.globeMesh.material.uniforms.uCameraOffsetY.value += (this.globeScrollOffset - this.globeMesh.material.uniforms.uCameraOffsetY.value) * this.options.scrollSmoothing
        }

        this.currMarkerScrollOffset += (this.markersScrollOffset - this.currMarkerScrollOffset) * this.options.scrollSmoothing

        // Compute the camera view-projection matrix to use it on the markers
        this.camera.update()
        vec3.set(this.cameraPosition, this.camera.worldMatrix[12], this.camera.worldMatrix[13], this.camera.worldMatrix[14])
        mat4.copy(this.viewProjectionMatrix, this.camera.projectionMatrix)
        mat4.multiply(this.viewProjectionMatrix, this.viewProjectionMatrix, this.camera.inverseWorldMatrix)

        // Auto rotate the globe if not hover a marker
        if (!this._isHoverMarker) {
            this.globeAutoRotation += this.options.autoRotationSpeed
            this.globeMesh.rotation[1] = this.globeAutoRotation
        }

        this.globeMesh.updateMatrix()
        this.globeMesh.updateWorldMatrix()

        let screenPos = vec3.create()
        this.markers.forEach((marker, i) => {
            // Get marker 3D position and project it on screen to get 2D position
            vec3.set(screenPos, marker.position[0], marker.position[1], marker.position[2])
            vec3.transformMat4(screenPos, screenPos, this.globeMesh.worldMatrix)
            vec3.transformMat4(screenPos, screenPos, this.viewProjectionMatrix)

            // Marker 2D screen position (starting from top left corner of screen)
            let x = ((screenPos[0] + 1) / 2) * this.width
            let y = (1. - (screenPos[1] + 1) / 2) * this.height

            // Compute marker Normal
            let N = vec3.create()
            vec3.set(N, marker.position[0], marker.position[1], marker.position[2])
            vec3.transformMat4(N, N, this.globeMesh.worldMatrix)
            vec3.normalize(N, N)

            // Compute view vector (camera direction)
            let V = vec3.create()
            vec3.set(V, marker.position[0], marker.position[1], marker.position[2])
            vec3.subtract(V, V, this.cameraPosition)
            vec3.normalize(V, V)

            // Marker is behind the globe: clamp it to the globe edge
            if (vec3.dot(V, N) * -1 < 0) {
                let dir = vec2.create()
                vec2.set(dir, x, y)
                let center = vec2.create()
                vec2.set(center, this.width/2, this.height/2)
                let dir2d = vec2.clone(dir) // vec2.clone(dir, dir)
                vec2.subtract(dir2d, dir2d, center)
                vec2.normalize(dir2d, dir2d)
                vec2.scale(dir2d, dir2d, this.circleScreenSize)
                vec2.add(dir2d, dir2d, center)

                dir2d[1] += this.currMarkerScrollOffset
                marker.el.style.transform = `translate(${dir2d[0]}px, ${dir2d[1]}px) translateZ(0)`
                marker.el.classList.remove('is-active')
            }
            // Marker is in front of the globe; update 2D position
            else {
                y += this.currMarkerScrollOffset
                marker.el.style.transform = `translate(${x}px, ${y}px) translateZ(0)`
                marker.el.classList.add('is-active')
            }
        })

        // Render WebGL frame
        this.renderer.clearColor(0,0,0,0) //[RGBA] alpha is set to 0 to have a transparent background on the webgl
        this.renderer.clear()
        this.renderer.render(this.scene, this.camera)
    }
}

// window.WebglGlobe = WebglGlobe
export default WebglGlobe