<style lang="scss">
    @import "../../style/atoms/arrow";
</style>

<script lang="ts">
    export let color: string = undefined
    export let flip: boolean = false
</script>

<svg width="12" height="14"
    class="arrow arrow--{color}"
    class:arrow--flip={flip}
>
    <use xlink:href="#arrow" />
</svg>