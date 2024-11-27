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

export function shuffle(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export function deepEqual(obj1: any, obj2: any): boolean
{
    if (obj1 === obj2) return true;

    if (typeof obj1 !== 'object' || obj1 === null ||
        typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key)) return false;
        if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
}