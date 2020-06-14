import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    useHistory,
} from 'react-router-dom';
import './App.css';
import {
    CommunityMap,
    Pin,
    initFirebase,
    detectLocation,
} from '@opencommunitymap/react-sdk';
import mapStyles from './MapsGoogleDarkStyle.json';
import {
    NavigationWidget,
    Splash,
    ProfileWidget,
    renderObject,
    MyProfile,
    Create,
    Nonzone,
} from './main_components';
import {
    AuthProvider,
    useAuth,
    useUserPublicProfile,
    googleSignIn,
} from './Auth';
import * as firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/database';
import firebaseConfig from './firebaseConfig';
import { addNewObject } from './api';

firebase.initializeApp(firebaseConfig);

const GOOGLE_API_KEY = process.env.REACT_APP_GOOGLE_API_KEY || '';

// init OCM firebase too
const ocmFirebaseApp = initFirebase('development');

const defaultCenter = { latitude: 42.69, longitude: 23.32 };

const Map = () => {
    const [center, setCenter] = useState(defaultCenter);
    const [zoom, setZoom] = useState();

    const router = useHistory();

    const { user } = useAuth();
    const { profile, loading } = useUserPublicProfile(user?.uid);

    if (user && !loading && !profile) {
        router.replace('/profile');
    }

    const onCreate = (kind) => async (info) => {
        const data = { loc: center, kind, ...info };
        return addNewObject(data);
    };

    return (
        <>
            <Switch>
                <Route path="/" exact>
                    <CommunityMap
                        mapApiKey={GOOGLE_API_KEY}
                        autolocate
                        filterOrigin="non-zone"
                        mapStyles={mapStyles}
                        centerPin={<Pin color="#79CAB5" />}
                        center={center}
                        zoom={zoom}
                        showZoomControls={false}
                        profileWidget={<span />}
                        renderObject={renderObject}
                        navigationWidget={
                            <NavigationWidget
                                autolocate={() =>
                                    detectLocation()
                                        .then((loc) => setCenter(loc))
                                        .catch((err) => alert(err.message))
                                }
                                toggleMerchants={() => {
                                    // TODO
                                }}
                                createZone={() =>
                                    user
                                        ? router.push('/create')
                                        : googleSignIn()
                                }
                                // zoomIn={() => setZoom((zoom = 18) => zoom + 1)}
                                // zoomOut={() => setZoom((zoom = 18) => zoom - 1)}
                            >
                                <ProfileWidget
                                    onShowProfile={() =>
                                        router.push('/profile')
                                    }
                                />
                            </NavigationWidget>
                        }
                        onChange={(center, bounds, zoom) => {
                            setCenter(center);
                            setZoom(zoom);
                        }}
                    />
                </Route>
                <Route path="/profile">
                    <MyProfile onClose={() => router.push('/')} />
                </Route>
                <Route path="/create">
                    <Create
                        onClose={() => router.push('/')}
                        onSave={onCreate('story')}
                    />
                </Route>
                <Route path="/nonzone">
                    <Nonzone onClose={() => router.push('/')} />
                </Route>
            </Switch>
        </>
    );
};

function App() {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        setTimeout(() => setLoading(false), 1000);
    }, []);

    return (
        <div className="App">
            {loading && <Splash />}
            <Map />
        </div>
    );
}

export default () => (
    <Router>
        <AuthProvider>
            <App />
        </AuthProvider>
    </Router>
);
