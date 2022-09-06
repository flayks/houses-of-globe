import { Pane } from 'tweakpane'

export const createPane = (ctx: any) => {
    ctx.pane = new Pane({
        container: ctx.parent,
        title: 'Settings',
    })

    ctx.pane.addInput(ctx.params, 'autoRotate', {
        label: 'Auto-rotate',
    })
    ctx.pane.addInput(ctx.params, 'speed', {
        label: 'Rotation speed',
        min: 0.0005,
        max: 0.025,
        step: 0.00025,
    })
    ctx.pane.addInput(ctx.params, 'sunAngleDelta', {
        label: 'Sun angle delta',
        min: 0,
        max: 2 * Math.PI,
    })
}