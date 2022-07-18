interface AnimationsQueueItem {
    node: Node
    animation: Function
    delay: number
}

export class RevealQueue {
    items: AnimationsQueueItem[] = []
    queuedItems: AnimationsQueueItem[] = []
    timer = null
    observer = null

    constructor () {
        if (typeof IntersectionObserver === 'undefined') return

        this.observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.observer.unobserve(entry.target)
                    const item = this.findItemFromNode(entry.target)
                    this.queuedItems.push(item)

                    if (this.timer === null) {
                        this.run()
                    }
                }
            })
        })
    }

    // Add an animation in queue
    add (node: Node, animation: Function, delay: number) {
        this.items.push({
            node,
            animation,
            delay,
        })
        this.observer.observe(node)
    }

    // Remove node from queue and unobserve from IO
    remove (node: Node) {
        this.observer.unobserve(node)
        this.items = this.items.filter(v => v.node !== node)
        this.queuedItems = this.queuedItems.filter(v => v.node !== node)
    }

    // Run animation
    run () {
        if (this.queuedItems.length === 0) {
            this.timer = null
            return
        }

        const item = this.queuedItems[0]
        item.animation()
        this.remove(item.node)
        this.timer = window.setTimeout(this.run.bind(this), item.delay)
    }

    // Find item from node
    findItemFromNode (node: Node) {
        return this.items.find(i => i.node === node)
    }
}