import { Pane } from 'tweakpane'

export const createPane = (ctx: any) => {
    ctx.pane = new Pane({
        container: ctx.parent,
        title: 'Globe Settings',
    })


    /**
     * Rotation
     */
    const rotation = ctx.pane.addFolder({
        title: 'Rotation',
    })
    rotation.addInput(ctx.params, 'autoRotate', {
        label: 'Auto-rotate',
    })
    rotation.addInput(ctx.params, 'speed', {
        label: 'Rotation speed',
        min: 0.01,
        max: 2,
        step: 0.05,
    })


    /**
     * Markers
     */
    if (ctx.markers && ctx.markers.length > 0) {
        const markers = ctx.pane.addFolder({
            title: 'Markers',
        })
        markers.addInput(ctx.params, 'enableMarkers', {
            label: 'Enable markers',
        })
        markers.addInput(ctx.params, 'enableMarkersLinks', {
            label: 'Interactive',
        })
    }


    /**
     * Others
     */
    const misc = ctx.pane.addFolder({
        title: 'Misc',
    })
    // Sun position
    misc.addInput(ctx.params, 'sunAngleDelta', {
        label: 'Sun angle delta',
        min: 0,
        max: 2 * Math.PI,
    })
}