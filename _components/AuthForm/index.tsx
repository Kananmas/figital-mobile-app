import { useState } from "react";
import { View } from "react-native";
import Input from "../Input";
import FigitalButton from "../Button";

import { StyleSheet } from "react-native";
import { useEvents } from "../../context/Events";
import { useAuth } from "../../context/Auth";
import { AUTH_API_ENDPOINTS } from "../../constants/api.consts";
import { Loader } from "lucide-react-native";
import { Text } from "react-native-svg";
import { useNav } from "../../context/Pages";

export default function AuthForm() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [showOtp, setShowOtp] = useState(false)
    const [loading, setLoading] = useState(false);
    const events = useEvents();
    const auth = useAuth();
    const nav = useNav();

    function openSnackbar(message: string, mode = 'warning') {
        events.emitEvent("snackbar", {
            message,
            mode,
        })
    }

    const handleClickSend = async () => {
        if (!phoneNumber.startsWith('09') && !phoneNumber.startsWith("98")) {
            openSnackbar("شماره شما صحیح نیست! لطفا دوباره وارد کنید.");
            return;
        }
        if (phoneNumber.length != 11) {
            openSnackbar("شماره شما صحیح نیست! لطفا دوباره وارد کنید.");
            return;
        }


        //request
        setLoading(() => true)
        try {
            const response = await fetch(AUTH_API_ENDPOINTS.REQUEST_OTP, {
                body: JSON.stringify({
                    phone_number: phoneNumber,
                }),
                method: "POST",
                headers: {
                    'content-type': 'application/json',
                    credentials: "omit",
                }
            })

            if (response.ok) {
                setShowOtp(() => true)
            }
        } catch (error) {
            if (error instanceof Error) {
                openSnackbar(error?.message, 'error')
            }
        } finally {
            setLoading(() => false)
        }

    }


    async function handleClickConfirm() {
        if (otpCode.length == 0) {
            openSnackbar("لطفا کد را وارد نامید!");
            return;
        }
        setLoading(() => true)
        const response = await fetch(AUTH_API_ENDPOINTS.VERIFY_OTP, {
            body: JSON.stringify({
                phone_number: phoneNumber,
                otp_code: otpCode
            }),
            method: "POST",
            headers: {
                'content-type': 'application/json',
                credentials: "omit",
            }
        })

        if (response.ok) {
            const result = await response.json();
            auth.setAccessToken(() => result.access_token)
            auth.setRefreshToken(() => response.headers.get("set-cookie") ?? "")
            await auth.saveTokens();
            openSnackbar("ورود با موفقیت!", "success")
            nav.setLocation("/rooms");
        }


        setLoading(() => false)

    }

    const handleChangePhoneNumber = (text: string) => {
        if (loading) return;
        const allNum = /[0-9]/.exec(text) || text.length == 0
        if (text.length < 12 && allNum) {
            setPhoneNumber(() => text)
        }
    }

    const handleChangeCode = (text: string) => {
        if (loading) return;
        const allNum = /[0-9]/.exec(text) || !text;
        if (text.length < 7 && allNum) {
            setOtpCode(() => text);
        }
    }

    if (loading) {
        return <View style={styles.loadingView}>
            <Loader size={60} color={"#71eb25ff"}/>
            <Text>
                در حال ارسال
            </Text>
        </View>
    }


    return <View style={styles.authForm}>
        {
            !showOtp ? <>
                <Input
                    value={phoneNumber}
                    inputStyles={styles.inputStyles}
                    title="شماره تلفن:" onChange={handleChangePhoneNumber} />
                <FigitalButton disabled={loading} title="تایید" onPress={handleClickSend} />
            </> :
                <>
                    <Input
                        value={otpCode}
                        inputStyles={styles.inputStyles}
                        title="کد ورود:" onChange={handleChangeCode} />
                    <FigitalButton disabled={loading} title="ورود" onPress={handleClickConfirm} />
                </>
        }
    </View>
}


const styles = StyleSheet.create({
    authForm: {
        height: 200,
        display: 'flex',
        justifyContent: 'center'
    },
    inputStyles: { textAlign: 'center', fontSize: 18 },
    loadingView: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})