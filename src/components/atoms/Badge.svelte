<style lang="scss">
    @import "../../style/atoms/badge";
</style>

<script lang="ts">
    export let text: string
    export let size: string = 'small'
</script>

<div class="badge badge--{size}">
    <span>{text}</span>
</div>