import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { getItem, removeItem, setItem } from "../../utils/storage.utils"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../constants/app.consts"

interface AuthContext {
    accessToken: string | null,
    setAccessToken: Function | Dispatch<SetStateAction<string>>,
    userInfo: null | object | Object
    setUserInfo: Function | Dispatch<SetStateAction<null | object | Object>>
    refreshToken: string | null,
    setRefreshToken: Function | Dispatch<SetStateAction<string>>
}

const Context = createContext<AuthContext>({
    accessToken: "",
    setAccessToken: () => { },
    userInfo: {},
    setUserInfo: () => { },
    refreshToken: '',
    setRefreshToken: () => { },
})

export const useAuth = () => useContext(Context);

let interval: number | null = null;

export default function AuthProvider({ children }: React.PropsWithChildren) {
    const [accessToken, setAccessToken] = useState("");
    const [userInfo, setUserInfo] = useState<null | object | Object>(null);
    const [refreshToken, setRefreshToken] = useState<string>("");

    useEffect(() => {
        initTokens();
    }, [])

    function initTokens() {
        getItem(ACCESS_TOKEN_KEY).then((value) => {
            if (typeof value === 'string') {
                setAccessToken(() => value)
            }
        })

        getItem(REFRESH_TOKEN_KEY).then((value) => {
            if (typeof value === 'string') {
                setRefreshToken(() => value)
            }
        })
    }

    useEffect(() => {
        if (accessToken) {
            setItem(ACCESS_TOKEN_KEY, accessToken)
            return;
        }

        removeItem(ACCESS_TOKEN_KEY)
    }, [accessToken])


    useEffect(() => {
        if (refreshToken) {
            setItem(REFRESH_TOKEN_KEY, refreshToken)
            return;
        }

        removeItem(REFRESH_TOKEN_KEY)
    }, [refreshToken])


    return <Context.Provider value={{
        accessToken,
        setAccessToken,
        userInfo,
        setUserInfo,
        refreshToken,
        setRefreshToken
    }}>
        {children}
    </Context.Provider>
}