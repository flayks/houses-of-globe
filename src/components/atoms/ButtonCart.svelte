<style lang="scss">
    @import "../../style/atoms/button-cart";
</style>

<script lang="ts">
    import { scale } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    import { cartOpen, cartAmount } from '$utils/stores/shop'
    // Components
    import Icon from '$components/atoms/Icon.svelte'
    import ButtonCircle from '$components/atoms/ButtonCircle.svelte'

    const openCart = () => {
        $cartOpen = true
    }
</script>

<div class="button-cart">
    <ButtonCircle color="purple" on:click={openCart}>
        <Icon icon="bag" label="Cart icon" />
        {#if $cartAmount > 0}
            <span class="quantity" transition:scale={{ start: 0.6, duration: 400, easing: quartOut }}>{$cartAmount}</span>
        {/if}
    </ButtonCircle>
</div>