import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity
} from 'react-native';

const settingsOptions = [
    {
      title: 'OpenAI API key',
      onPress: () => {},
    },
];

export default function Index() {
    return (
        <View style={styles.container}>
            {settingsOptions.map(({title, subTitle, onPress}, index) => (
                <TouchableOpacity key={title} onPress={onPress}>
                    <View style={styles.option}>
                        <Text style={styles.optTitle}>{title}</Text>
                        <TextInput style={styles.optTextInput}></TextInput>
                    </View>
                </TouchableOpacity>
            ))}
            <Pressable
                onPress={async () => {
                    // setLoading(true);
                    // const photo = await cameraRef.current?.takePictureAsync({
                    //     base64: true,
                    // });
                    // setPhoto(photo?.base64);
                }}
                style={styles.saveButton}
            >
                Save Settings
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        verticalAlign: 'top',
        // padding: 20,
        gap: 20,
        backgroundColor: '#000',
        borderWidth: 1,
        borderColor: '#f4c',
    },
    option: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        verticalAlign: 'top',
        borderWidth: 1,
        borderColor: '#f4c',
    },
    optTitle: {
        paddingVertical: 10,
        color: '#fff',
    },
    optTextInput: {
        paddingHorizontal: 5,
        paddingVertical: 5,
        backgroundColor: '#888',
        color: '#fff',
        borderWidth: 1,
        borderColor: '#fff',
    },
    saveButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ccc',
        borderRadius: 15,
        color: '#000',
    },
});
