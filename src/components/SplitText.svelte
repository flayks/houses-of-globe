<script lang="ts">
    import { splitText } from '$utils/functions'

    export let text: string
    export let mode: string = undefined
    export let clone: boolean = false

    $: split = splitText(text, mode)

    const classes = ['text-split', $$props.class].join(' ').trim()
</script>

{#if clone}
    {#if mode && mode === 'words'}
        <span class={classes}>
            {#each Array(2) as _, index}
                <span class="text-split__line" aria-hidden={index === 1}>
                    {#each split as word, i}
                        <span class="word" style="--i-w: {i};">{word}</span>{#if word.includes('\n')}<br>{/if}
                        <!-- svelte-ignore empty-block -->
                        {#if i < split.length - 1}{/if}
                    {/each}
                </span>
            {/each}
        </span>
    {:else}
        <span class={classes}>
            {#each Array(2) as _, index}
                <span class="text-split__line" aria-hidden={index === 1}>
                    {text}
                </span>
            {/each}
        </span>
    {/if}

{:else}
    <span class={classes}>
        {#each split as char, i}
            <span class="char" style="--i-c: {i};">{char}</span>
        {/each}
    </span>
{/if}