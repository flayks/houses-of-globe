/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare namespace App {
	// interface Locals {}
	// interface Platform {}
	// interface Session {}
	// interface Stuff {}
}


/**
 * Custom Events
 */
// Swipe
declare namespace svelte.JSX {
    interface HTMLAttributes<T> {
        onswipe?: (event: CustomEvent<string> & { target: EventTarget & T }) => any,
        ontap?: (event: CustomEvent<boolean> & { target: EventTarget & T }) => any,
    }
}