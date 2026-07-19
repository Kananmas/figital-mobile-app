import { StyleSheet, Text, TextInput, View } from "react-native";
import styleVars from "../../style.vars";


export default function Input({
    onChange,
    title,
    value,
    customStyles,
    textStyles,
    inputStyles,
}: {
    onChange?: Function,
    title?: string,
    value?: string,
    customStyles?: { [name: string]: number | string }
    textStyles?: { [name: string]: number | string }
    inputStyles?: { [name: string]: number | string }
}) {

    function handleOnChange(e: string) {
        onChange?.(e);
    }


    return <View style={{ ...styles.holder, ...customStyles }}>
        <Text style={{ ...styles.text, ...textStyles }}>{title?.toUpperCase()}</Text>
        <TextInput
            value={value}
            style={{ ...styles.input, ...inputStyles }}
            onChangeText={handleOnChange} />
    </View>
}


const styles = StyleSheet.create({
    holder: {
        display: 'flex',
        flex: 1,
        direction: "rtl",
        flexDirection: "column",
        height: 200,
        color: 'white',
        padding: 12,
    },
    input: {
        backgroundColor: styleVars.neutralColor,
        borderRadius: styleVars.verticalSpacing,
        paddingLeft: styleVars.horizontalSpacing,
        paddingRight: 8,
    },
    text: {
        fontSize: 20,
        marginBottom: styleVars.verticalSpacing,
        fontWeight: 600,
    }

})