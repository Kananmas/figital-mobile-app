import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setItem<T>(key: string, value: T) {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
        console.error(err);
    }
}

export async function getItem<T>(key: string): Promise<T | null> {
    try {
        const value = await AsyncStorage.getItem(key);

        if (value === null) {
            return null;
        }

        return JSON.parse(value);
    } catch (err) {
        console.error(err);
        return null;
    }
}

export async function removeItem(key: string) {
    try {
        await AsyncStorage.removeItem(key);
    } catch (err) {
        console.error(err);
    }
}