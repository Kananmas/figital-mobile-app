import { useState } from "react";
import { View } from "react-native";
import Input from "../Input";
import FigitalButton from "../Button";

import { StyleSheet } from "react-native";
import { useEvents } from "../../context/Events";

export default function AuthForm() {
    const [phoneNumber, setPhoneNumber] = useState("");
    const events = useEvents();

    function openSnackbar(message:string) {
        events.emitEvent("snackbar", {
            message,
            mode: 'warning',
        })
    }

    const handleClickSend = () => {
        if (!phoneNumber.startsWith('09') && !phoneNumber.startsWith("98")) {
            openSnackbar("شماره شما صحیح نیست! لطفا دوباره وارد کنید.");
            return;
        }
        if (phoneNumber.length != 11) {
            openSnackbar("شماره شما صحیح نیست! لطفا دوباره وارد کنید.");
            return;
        }


        //request

    }

    const handleChangePhoneNumber = (text: string) => {
        const allNum = /[0-9]/.exec(text) || text.length == 0
        if (text.length < 12 && allNum) {
            setPhoneNumber(() => text)
        }
    }


    return <View style={styles.authForm}>
        <Input
            value={phoneNumber}
            inputStyles={{ textAlign: 'center', fontSize: 18 }}
            title="شماره تلفن:" onChange={handleChangePhoneNumber} />
        <FigitalButton title="تایید" onPress={handleClickSend} />
    </View>
}


const styles = StyleSheet.create({
    authForm: {
        height: 200,
        marginTop: 300,
        display: 'flex',
        justifyContent: 'center'
    }
})