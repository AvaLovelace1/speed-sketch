/**
 * Generic state manager for a reorderable list with single-item selection.
 */
export class ListManager<T> {
    #selectedIdx: number;

    constructor(public readonly items: T[]) {
        this.#selectedIdx = $state(items.length > 0 ? 0 : -1);
    }

    // If -1, means that nothing is selected.
    get selectedIdx() {
        return this.#selectedIdx;
    }

    set selectedIdx(value: number) {
        if (value < -1 || value >= this.items.length) {
            throw new Error(`selectedIdx out of range: ${value}`);
        }
        this.#selectedIdx = value;
    }

    addItem = (newItem: T) => {
        this.items.splice(this.selectedIdx + 1, 0, newItem);
        this.selectedIdx++;
    };

    removeItem = () => {
        if (this.selectedIdx === -1) return;
        this.items.splice(this.selectedIdx, 1);
        this.selectedIdx = Math.min(this.selectedIdx, this.items.length - 1);
    };

    moveItemUp = () => {
        if (this.selectedIdx === -1 || this.selectedIdx === 0) return;
        const item = this.items[this.selectedIdx];
        this.items[this.selectedIdx] = this.items[this.selectedIdx - 1];
        this.items[this.selectedIdx - 1] = item;
        this.selectedIdx--;
    };

    moveItemDown = () => {
        if (this.selectedIdx === -1 || this.selectedIdx === this.items.length - 1) return;
        const item = this.items[this.selectedIdx];
        this.items[this.selectedIdx] = this.items[this.selectedIdx + 1];
        this.items[this.selectedIdx + 1] = item;
        this.selectedIdx++;
    };

    moveItem = (newIdx: number) => {
        if (this.selectedIdx === -1) return;
        if (newIdx < 0 || newIdx >= this.items.length) {
            throw new Error(`newIdx out of range: ${newIdx}`);
        }
        const item = this.items[this.selectedIdx];
        this.removeItem();
        this.selectedIdx = newIdx - 1;
        this.addItem(item);
    };
}
