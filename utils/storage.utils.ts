import {
    addToStorage,
    getStorage,
    removeFromStorage,
} from "./file-system.utils";

export async function setItem<T>(key: string, value: T) {
    try {
        await addToStorage(
            key,
            value
        );
    } catch (err) {
        console.error(err);
    }
}

export async function getItem<T>(key: string): Promise<T | null> {
    try {
        const value = await getStorage(key);

        if (value === undefined) {
            return null;
        }

        return value as T;
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function removeItem(key: string) {
    try {
        await removeFromStorage(key);
    } catch (err) {
        console.error(err);
    }
}
