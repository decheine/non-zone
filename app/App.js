import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
import './services/firebase_init';

import useCachedResources from './hooks/useCachedResources';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import LinkingConfiguration from './navigation/LinkingConfiguration';
import ShowStoryScreen from './screens/ShowStoryScreen';
import CreateStoryScreen from './screens/CreateStoryScreen';

import { AuthProvider } from './services/auth';

import { YellowBox } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
    YellowBox.ignoreWarnings(['Setting a timer']);
    const isLoadingComplete = useCachedResources();

    if (!isLoadingComplete) {
        return null;
    } else {
        return (
            <AuthProvider>
                <View style={styles.container}>
                    {Platform.OS === 'ios' && (
                        <StatusBar barStyle="dark-content" />
                    )}
                    <NavigationContainer linking={LinkingConfiguration}>
                        <Stack.Navigator>
                            <Stack.Screen
                                name="Root"
                                component={BottomTabNavigator}
                            />
                            <Stack.Screen
                                name="ShowStory"
                                component={ShowStoryScreen}
                                options={({ route }) => ({
                                    title: route.params.title,
                                })}
                            />
                            <Stack.Screen
                                name="CreateStory"
                                component={CreateStoryScreen}
                                options={({ route }) => ({
                                    title: 'Create story',
                                })}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </View>
            </AuthProvider>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});
