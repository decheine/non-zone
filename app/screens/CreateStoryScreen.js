import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
    Input,
    Button,
    Image,
    Icon,
    Text,
    ButtonGroup,
} from 'react-native-elements';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import {
    saveObject,
    publishObject,
    useAuth,
    uploadToCloudinary,
} from 'nonzone-lib';

import WalletScreen from './WalletScreen';
import Colors from '../constants/Colors';

const { width } = Dimensions.get('window');

export default function CreateStoryScreen({ route, navigation }) {
    const position = route.params;
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const { user } = useAuth();
    let [kindIndex, setKindIndex] = useState(0);

    useEffect(() => {
        const getPermission = async () => {
            if (Constants.platform.ios) {
                const { status } = await Permissions.askAsync(
                    Permissions.CAMERA_ROLL
                );
                if (status !== 'granted') {
                    alert(
                        'Sorry, we need camera roll permissions to make this work!'
                    );
                }
            }
            if (Constants.platform.android) {
                const { status } = await Permissions.askAsync(
                    Permissions.CAMERA
                );
                if (status !== 'granted') {
                    alert(
                        'Sorry, we need camera permissions to make this work!'
                    );
                }
            }
        };

        getPermission();
    }, []);

    const _pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 1,
                base64: true,
            });
            if (!result.cancelled) {
                setImage('data:image/jpeg;base64,' + result.base64);
            }

            console.log(result);
        } catch (E) {
            console.log(E);
        }
    };

    const _captureImage = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 1,
                base64: true,
            });
            if (!result.cancelled) {
                setImage('data:image/jpeg;base64,' + result.base64);
            }

            console.log(result);
        } catch (E) {
            console.log(E);
        }
    };

    const _saveStory = async () => {
        if (image) {
            const uploadedImage = await uploadToCloudinary(image);
            console.log(uploadedImage);

            const data = {
                id: null,
                kind: kindIndex == 0 ? 'memory' : 'fiction',
                type: 'story',
                loc: position,
                uid: user.uid,
                title,
                description,
                image: uploadedImage.secure_url,
            };
            const id = await saveObject(data);
            console.log('save object result', id);
            data.id = id;
            await publishObject(data);

            if (id) {
                alert('Story saved!');
                navigation.navigate('MapScreen');
            } else {
                alert('something went wrong!');
            }
        }
    };

    return user ? (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon
                        size={24}
                        name="close"
                        color="white"
                        style={{ marginRight: 10 }}
                    />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.inputContainer}>
                    <Input
                        placeholder="Title: Between 3 and 5 words"
                        inputStyle={{ color: Colors.background }}
                        value={title}
                        onChangeText={(text) => setTitle(text)}
                    />
                    <Input
                        placeholder="Description"
                        inputStyle={{
                            color: Colors.background,
                            textAlignVertical: 'top',
                            paddingTop: 0,
                        }}
                        inputContainerStyle={{
                            borderBottomColor: 'transparent',
                        }}
                        value={description}
                        onChangeText={(text) => setDescription(text)}
                        multiline
                        numberOfLines={10}
                        maxLength={600}
                    />
                    <Text
                        style={{
                            color: Colors.tintColor,
                            textAlign: 'right',
                            marginRight: 10,
                            fontSize: 11,
                        }}
                    >
                        {600 - description.length + ' characters left'}
                    </Text>
                </View>
                <View style={styles.buttonBox}>
                    <Button
                        containerStyle={{ flex: 1, paddingRight: 5 }}
                        buttonStyle={{ backgroundColor: 'white' }}
                        titleStyle={{ color: 'black' }}
                        icon={{ name: 'folder', size: 30, color: 'black' }}
                        title="Browse"
                        onPress={_pickImage}
                    />
                    <Button
                        containerStyle={{ flex: 1, paddingLeft: 5 }}
                        buttonStyle={{ backgroundColor: 'white' }}
                        titleStyle={{ color: 'black' }}
                        icon={{ name: 'camera-alt', size: 30, color: 'black' }}
                        title="Capture"
                        onPress={_captureImage}
                    />
                </View>

                <Text
                    style={{ fontSize: 16, fontWeight: 'bold', marginTop: 20 }}
                >
                    Story type
                </Text>

                <ButtonGroup
                    buttons={['#Memory', '#Fiction']}
                    buttonStyle={{
                        backgroundColor: '#00404C',
                        borderRadius: 5,
                    }}
                    textStyle={{ color: '#F2F6FC' }}
                    selectedButtonStyle={{
                        backgroundColor: 'white',
                        borderRadius: 5,
                    }}
                    selectedTextStyle={{ color: '#8D8D8F' }}
                    containerStyle={{
                        backgroundColor: 'transparent',
                        borderColor: 'transparent',
                        width: '100%',
                        alignSelf: 'center',
                    }}
                    innerBorderStyle={{ width: 10, color: 'transparent' }}
                    selectedIndex={kindIndex}
                    onPress={(selectedIndex) => setKindIndex(selectedIndex)}
                />

                {image && (
                    <Image
                        source={{ uri: image }}
                        style={{
                            height: 244,
                            width: width - 20,
                            resizeMode: 'contain',
                        }}
                    />
                )}
                <Button
                    title="Publish"
                    buttonStyle={{
                        backgroundColor: Colors.tintColor,
                        width: '50%',
                        alignSelf: 'center',
                        marginVertical: 20,
                    }}
                    onPress={_saveStory}
                />
            </ScrollView>
        </View>
    ) : (
        <WalletScreen />
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.tintBackground,
        flex: 1,
    },
    contentContainer: {
        marginHorizontal: 15,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 20,
        paddingHorizontal: 10,
    },
    description: {
        marginVertical: 10,
    },
    inputContainer: {
        backgroundColor: 'white',
        borderRadius: 5,
        paddingVertical: 10,
    },
    buttonBox: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
    },
});
