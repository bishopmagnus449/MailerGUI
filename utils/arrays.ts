export function moveItem(array: any[], fromIndex: number|any, toIndex: number|any) {
    if (fromIndex < 0 || fromIndex >= array.length || toIndex < 0 || toIndex >= array.length) {
        console.error("Index out of bounds");
        return;
    }

    if (typeof fromIndex !== "number") {
        fromIndex = array.indexOf(fromIndex)
    }

    if (typeof toIndex !== "number") {
        toIndex = array.indexOf(toIndex)
    }

    const element = array.splice(fromIndex, 1)[0];
    array.splice(toIndex, 0, element);
}

export function getRandomMember(arr: any[]) {
    if (!Array.isArray(arr) || arr.length === 0) {
        throw new Error('Input must be a non-empty array.');
    }
    const randomIndex = Math.floor(Math.random() * arr.length);
    return arr[randomIndex];
}