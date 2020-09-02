import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import { Button } from 'react-native-elements';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import mapStyle from '../constants/mapStyle';
import { useLoadStories } from '../services/db';
import * as Location from 'expo-location';
import Colors from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const SCREEN_HEIGHT = height;
const SCREEN_WIDTH = width;
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 10;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export const MapScreen = (props) => {
    let [location, setLocation] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
    });

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestPermissionsAsync();
            if (status !== 'granted') {
                console.log('location not granted');
            }

            let position = await Location.getCurrentPositionAsync({});
            console.log(position);
            setLocation({
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        })();
    }, []);
    const { error, loading, data = [] } = useLoadStories();
    // console.log({ error, loading, data });

    return (
        <View style={styles.container}>
            <MapView
                style={styles.mapStyle}
                region={location}
                minZoomLevel={2}
                maxZoomLevel={18}
                customMapStyle={mapStyle}
                provider={PROVIDER_GOOGLE}
                onLongPress={(mapEvent) => {
                    const { coordinate } = mapEvent.nativeEvent;
                    console.log(coordinate);
                    props.navigation.navigate('CreateStory', coordinate);
                }}
            >
                {data.map((marker) => (
                    <Marker
                        key={marker.title}
                        coordinate={marker.loc}
                        title={marker.title}
                        description={marker.description}
                        image={require('../assets/images/marker.png')}
                    >
                        <Callout
                            style={styles.calloutStyle}
                            tooltip={true}
                            onPress={() =>
                                props.navigation.navigate('ShowStory', marker)
                            }
                        >
                            <View style={styles.boxStyle}>
                                <Text
                                    style={{
                                        color: 'white',
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        marginBottom: 8,
                                    }}
                                >
                                    {marker.title}
                                </Text>
                                <Text
                                    numberOfLines={7}
                                    ellipsizeMode="tail"
                                    style={{ color: 'white', fontSize: 12 }}
                                >
                                    {marker.description.replace(
                                        /[\r\n]+/gm,
                                        ' '
                                    )}
                                </Text>
                            </View>
                            <Button title="Open this Story" />
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
};

export default MapScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapStyle: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    },
    calloutStyle: {
        width: 200,
    },
    boxStyle: {
        paddingHorizontal: 12,
        paddingVertical: 20,
        backgroundColor: Colors.background,
        borderColor: Colors.tintColor,
        borderWidth: 2,
        borderRadius: 10,
    },
});