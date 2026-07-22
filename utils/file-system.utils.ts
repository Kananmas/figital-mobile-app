import RNFS from 'react-native-fs';

type Storage = Record<string, unknown>;

const storageDirectory = `${RNFS.DocumentDirectoryPath}/figital`;
const storageFile = `${storageDirectory}/storage.json`;

let cache: Storage | null = null;
let pendingMutation: Promise<void> = Promise.resolve();

const loadStorage = async (): Promise<Storage> => {
    if (cache !== null) {
        return cache;
    }

    await RNFS.mkdir(storageDirectory);

    if (!(await RNFS.exists(storageFile))) {
        cache = {};
        return cache;
    }

    const contents = await RNFS.readFile(storageFile, 'utf8');
    cache = contents ? JSON.parse(contents) as Storage : {};
    return cache;
};

const mutateStorage = (mutation: (storage: Storage) => void): Promise<void> => {
    const result = pendingMutation.then(async () => {
        const storage = await loadStorage();
        mutation(storage);
        await RNFS.writeFile(storageFile, JSON.stringify(storage), 'utf8');
    });

    // Keep later mutations running even if this individual operation fails.
    pendingMutation = result.catch(() => undefined);
    return result;
};

export const getStorage = async (key?: string): Promise<unknown> => {
    await pendingMutation;
    const storage = await loadStorage();
    return key === undefined ? storage : storage[key];
};

export const addToStorage = async (key: string, data: unknown): Promise<void> => {
    await mutateStorage(storage => {
        storage[key] = data;
    });
};

export const removeFromStorage = async (key: string): Promise<void> => {
    await mutateStorage(storage => {
        delete storage[key];
    });
};
