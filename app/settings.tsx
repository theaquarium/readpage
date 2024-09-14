import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function Index() {
    return (
        <View style={styles.container}>
            <TextInput></TextInput>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        gap: 20,
        backgroundColor: '#000',
    },
});
