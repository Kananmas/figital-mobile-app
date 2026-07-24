import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { getItem, removeItem, setItem } from "../../utils/storage.utils"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "../../constants/app.consts"
import { AUTH_API_ENDPOINTS } from "../../constants/api.consts"

interface AuthContext {
    accessToken: string | null,
    setAccessToken: Function | Dispatch<SetStateAction<string>>,
    userInfo: null | object | Object
    setUserInfo: Function | Dispatch<SetStateAction<null | object | Object>>
    refreshToken: string | null,
    setRefreshToken: Function | Dispatch<SetStateAction<string>>
    saveTokens: Function,
}

const Context = createContext<AuthContext>({
    accessToken: "",
    setAccessToken: () => { },
    userInfo: {},
    setUserInfo: () => { },
    refreshToken: '',
    setRefreshToken: () => { },
    saveTokens: () => { },
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
                console.log(`${ACCESS_TOKEN_KEY}:${value}`)
                intiUserInfo(value);
            }
        })

        getItem(REFRESH_TOKEN_KEY).then((value) => {
            if (typeof value === 'string') {
                setRefreshToken(() => value)
                console.log(`${REFRESH_TOKEN_KEY}:${value}`)
            }

        })
    }

    async function intiUserInfo(accessToken: string) {
        const response = await fetch(AUTH_API_ENDPOINTS.USER_PROFILE, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
            }
        })

        if (response.ok) {
            const userData = await response.json();
            setUserInfo(() => userData.user);
        }

        if (response.status == 401) {
            setAccessToken(() => "");
            removeItem(ACCESS_TOKEN_KEY)
        }
    }

    async function saveTokens() {
        if (accessToken) {
            await setItem(ACCESS_TOKEN_KEY, accessToken);
        }

        if (refreshToken) {
            await setItem(REFRESH_TOKEN_KEY, refreshToken)
        }
    }

    return <Context.Provider value={{
        accessToken,
        setAccessToken,
        userInfo,
        setUserInfo,
        refreshToken,
        setRefreshToken,
        saveTokens
    }}>
        {children}
    </Context.Provider>
}