<style lang="scss">
    @import "../../style/molecules/newsletter-form";
</style>

<script lang="ts">
    import { fly } from 'svelte/transition'
    import { quartOut } from 'svelte/easing'
    // Components
    import IconArrow from '$components/atoms/IconArrow.svelte'
    import ButtonCircle from '$components/atoms/ButtonCircle.svelte'

    export let past: boolean = false

    let inputInFocus = false
    let formStatus: string = null
    let formMessageTimeout: ReturnType<typeof setTimeout> | number
    const formMessages = {
        PENDING: `Almost there! Please confirm your email address through the email you'll receive soon.`,
        MEMBER_EXISTS_WITH_EMAIL_ADDRESS: `Uh oh! This email address is already subscribed to the newsletter.`,
        INVALID_EMAIL: `Woops. This email doesn't seem to be valid.`,
    }

    // Toggle input focus
    const toggleFocus = () => inputInFocus = !inputInFocus


    /**
     * Subscription form handling
     */
    const formSubmission = async ({ target }) => {
        const formData = new FormData(target)
        const email = String(formData.get('email'))

        if (email && email.match(/^([\w.-])+@([\w.-])+\.([a-zA-Z])+/)) {
            const req = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: email
            })

            const res = await req.json()
            formStatus = res.code

            if (res.code === 'PENDING') {
                sendEvent({ action: 'newsletterSubscribe' })
            }
        } else {
            formStatus = 'INVALID_EMAIL'
        }
    }

    $: if (formStatus !== 'PENDING') {
        clearTimeout(formMessageTimeout)
        formMessageTimeout = setTimeout(() => formStatus = null, 3000)
    }
</script>

<div class="newsletter-form">
    {#if formStatus !== 'PENDING'}
        <form method="POST" on:submit|preventDefault={formSubmission}
            out:fly={{ y: -8, easing: quartOut, duration: 600 }}
        >
            <div class="newsletter-form__email" class:is-focused={inputInFocus}>
                <input type="email" placeholder="Your email address" name="email" id="newsletter_email" required
                    on:focus={toggleFocus}
                    on:blur={toggleFocus}
                >
                <ButtonCircle
                    type="submit"
                    color="pink" size="small"
                    clone={true}
                    label="Subscribe"
                >
                    <IconArrow color="white" />
                </ButtonCircle>
            </div>

            <div class="newsletter-form__bottom">
                {#if past}
                    <a href="/subscribe" class="past-issues" sveltekit:noscroll sveltekit:prefetch>
                        <svg width="20" height="16" viewBox="0 0 20 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-label="Newsletter icon">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M18 2.346H2a.5.5 0 0 0-.5.5v11.102a.5.5 0 0 0 .5.5h16a.5.5 0 0 0 .5-.5V2.846a.5.5 0 0 0-.5-.5ZM2 .846a2 2 0 0 0-2 2v11.102a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.846a2 2 0 0 0-2-2H2Zm13.75 4.25h-2v3h2v-3Zm-2-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-2ZM3.5 6.5a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6Zm.25 3a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5Zm1.25 2a.5.5 0 0 0 0 1h6a.5.5 0 1 0 0-1H5Z" />
                        </svg>
                        <span>See past issues</span>
                    </a>
                {/if}
                <p>No spam, we promise!</p>
            </div>
        </form>
    {/if}

    {#if formStatus}
        <div class="newsletter-form__message shadow-small"
            class:is-error={formStatus !== 'PENDING'}
            class:is-success={formStatus === 'PENDING'}
            transition:fly={{ y: 8, easing: quartOut, duration: 600, delay: formStatus !== 'PENDING' ? 100 : 600 }}
        >
            <p class="text-xsmall">{formMessages[formStatus]}</p>
        </div>
    {/if}
</div>
