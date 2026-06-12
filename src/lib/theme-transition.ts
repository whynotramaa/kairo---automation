"use client"

import { flushSync } from "react-dom"

type StartViewTransitionFn = (callback: () => void) => { ready: Promise<void> }

/**
 * Switches theme with a circular reveal expanding from the click point.
 * Falls back to an instant switch when the View Transitions API is
 * unavailable or the user prefers reduced motion.
 */
export function toggleThemeWithTransition(
    applyTheme: () => void,
    event?: { clientX: number; clientY: number },
) {
    const startViewTransition = (
        document as Document & { startViewTransition?: StartViewTransitionFn }
    ).startViewTransition?.bind(document)

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
    ).matches

    if (!startViewTransition || prefersReducedMotion) {
        applyTheme()
        return
    }

    const x = event?.clientX ?? window.innerWidth / 2
    const y = event?.clientY ?? window.innerHeight / 2
    const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
    )

    const transition = startViewTransition(() => {
        flushSync(() => {
            applyTheme()
        })
    })

    transition.ready.then(() => {
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: 550,
                easing: "cubic-bezier(0.33, 1, 0.68, 1)",
                pseudoElement: "::view-transition-new(root)",
            },
        )
    })
}
