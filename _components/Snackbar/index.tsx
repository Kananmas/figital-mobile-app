import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useEvents } from "../../context/Events";
import { CircleAlert } from "lucide-react-native";

let timeout: number | null = null;

const MODES = {
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
}

export default function Snackbar() {
    const [message, setMessage] = useState("");
    const [show, setShow] = useState(false);
    const [mode, setMode] = useState(MODES.SUCCESS)
    const events = useEvents();

    const borderColor = useMemo(() => {
        switch (mode) {
            case MODES.SUCCESS:
                return "#c1ff80";
            case MODES.WARNING:
                return "#fd7a2fff";
            case MODES.ERROR:
                return "#f81a1aff";
            default:
                return 'black';
        }
    }, [mode])

    const animRef = useRef(new Animated.Value(0)).current

    useEffect(() => {
        Animated.timing(animRef, {
            toValue: show ? 10 : -600,
            duration: 500,
            useNativeDriver: true,
        }).start()

    }, [animRef, show])

    function handleOnSnackbar(e: any) {
        setMessage(e.message)
        setMode(e.mode);
        setShow(true)
        if (timeout != null) clearTimeout(timeout);
        timeout = setTimeout(() => setShow(false), 3000)
    }

    useEffect(() => {
        events.addEventListener("snackbar", handleOnSnackbar);

        return () => {
            events.removeEventListener("snackbar", handleOnSnackbar)
        }
    })



    return <Animated.View style={[
        styles.snackbar,
        {
            borderColor,
            transform: [{ translateX: animRef }]
        }
    ]}>
        <View style={styles.main}>
            <CircleAlert color={borderColor} />
            <Text style={{ direction: "rtl", fontSize: 14 }}>
                {message}
            </Text>
        </View>
    </Animated.View>
}




const styles = StyleSheet.create({
    snackbar: {
        position: "absolute",
        minWidth: 200,
        height: 60,
        borderWidth: 3,
        borderColor: 'black',
        borderRadius: 12,
        top: 60,
        padding: 4,
        gap: 4,
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'center',
    },
    main: {
        display: 'flex',
        flexDirection: 'row-reverse',
        flex: 1,
        width:'auto',
        gap:12,
        justifyContent: "center",
        alignItems: 'flex-end',
    }
})