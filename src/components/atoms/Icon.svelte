<script lang="ts">
    export let icon: string
    export let label: string = undefined

    const classes = [$$props.class].join(' ').trim()
</script>

<svg class={classes} aria-label={label} width="32" height="32">
    <use xlink:href="#icon-{icon}" />
</svg>