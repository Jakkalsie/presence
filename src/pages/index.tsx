import type { GetServerSideProps } from 'next';
import { Session } from 'next-auth';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { getServerAuthSession } from '../server/common/get-server-auth-session';
import { trpc } from '../utils/trpc';

import * as PusherPushNotifications from '@pusher/push-notifications-web';
import Link from 'next/link';

interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    locationTimestamp: Date;
}

const Home = ({ auth: session }: { auth: Session }) => {
    const [watchId, setWatchId] = useState<number>();
    const [locationData, setLocationData] = useState<LocationData | null>(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('getCurrentPosition');
                const { latitude, longitude, accuracy } = position.coords;
                setLocationData({ latitude, longitude, accuracy, locationTimestamp: new Date(position.timestamp) });
            },
            (err) => console.error(err),
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
        );

        const navigatorId = navigator.geolocation.watchPosition(
            (position) => {
                console.log(position);
                const { latitude, longitude, accuracy } = position.coords;
                setLocationData({ latitude, longitude, accuracy, locationTimestamp: new Date(position.timestamp) });
            },
            (err) => console.error(err),
            { enableHighAccuracy: true, maximumAge: 30000, timeout: 27000 }
        );

        setWatchId(navigatorId);

        return () => {
            console.log('unmount');
            navigator.geolocation.clearWatch(navigatorId);
        };
    }, []);

    const [logged, setLogged] = useState(false);
    const [loading, setLoading] = useState(false);
    const logPresence = trpc.presence.log.useMutation();

    const handleLogPresence = async () => {
        setLoading(true);
        await logPresence.mutateAsync({ deviceTimestamp: new Date(), location: locationData });
        setLogged(true);

        if (watchId) navigator.geolocation.clearWatch(watchId);
    };

    useEffect(() => {
        const beamsClient = new PusherPushNotifications.Client({
            instanceId: '078b5865-9258-4a02-82f4-151915d69bb5',
        });

        beamsClient
            .start()
            .then(() => beamsClient.addDeviceInterest('hello'))
            .then(() => console.log('Successfully registered and subscribed!'))
            .catch(console.error);
    }, []);

    return (
        <>
            <Head>
                <title>Zamaqo | Presence</title>
                <meta name="description" content="Generated by create-t3-app" />
                <link rel="icon" href="/favicon.ico" />

                <meta name="application-name" content="PWA App" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="PWA App" />
                <meta name="description" content="Best PWA App in the world" />
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="msapplication-config" content="/icons/browserconfig.xml" />
                <meta name="msapplication-TileColor" content="#2B5797" />
                <meta name="msapplication-tap-highlight" content="no" />
                <meta name="theme-color" content="#000000" />

                <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
                <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
                <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
                <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" />

                <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" />
                <link rel="shortcut icon" href="/favicon.ico" />

                <meta name="twitter:card" content="summary" />
                <meta name="twitter:url" content="https://yourdomain.com" />
                <meta name="twitter:title" content="PWA App" />
                <meta name="twitter:description" content="Best PWA App in the world" />
                <meta name="twitter:image" content="https://yourdomain.com/icons/android-chrome-192x192.png" />
                <meta name="twitter:creator" content="@DavidWShadow" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="PWA App" />
                <meta property="og:description" content="Best PWA App in the world" />
                <meta property="og:site_name" content="PWA App" />
                <meta property="og:url" content="https://yourdomain.com" />
                <meta property="og:image" content="https://yourdomain.com/icons/apple-touch-icon.png" />

                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover" />
            </Head>
            <main className="absolute inset-0 flex items-center justify-center flex-col gap-16">
                <div className="flex flex-col items-center">
                    <h1 className="text-4xl font-bold">Zamaqo | Presence</h1>
                    <p className="text-xl">Welcome {session.user?.name}</p>
                </div>
                {logged ? (
                    <>
                        <h1 className="text-2xl text-center py-4">Submission logged at {new Date().toLocaleTimeString()}</h1>
                    </>
                ) : (
                    <>
                        <button
                            className="shadow rounded-lg text-2xl font-medium px-6 py-4 enabled:hover:shadow-lg duration-100 disabled:opacity-50 disabled:bg-gray-100"
                            disabled={loading}
                            onClick={handleLogPresence}
                        >
                            Log Presence
                        </button>
                        <div className="flex flex-col items-center">
                            <span className="text-sm text-gray-500">Accuracy: {locationData?.accuracy || 'Unknown'}</span>
                            <span className="text-sm text-gray-500">Longitude: {locationData?.longitude || 'Unknown'}</span>
                            <span className="text-sm text-gray-500">Latitude: {locationData?.latitude || 'Unknown'}</span>
                        </div>
                    </>
                )}
                <Link href="/logs">
                    <a className="shadow rounded-lg text-xl font-medium px-4 py-2 hover:shadow-md duration-100 disabled:opacity-50">View logs</a>
                </Link>
            </main>
        </>
    );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getServerAuthSession(context);

    if (!session) {
        return {
            redirect: {
                destination: '/api/auth/signin',
                permanent: false,
            },
        };
    }

    return {
        props: {
            auth: session,
        },
    };
};
