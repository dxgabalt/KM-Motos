
import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

const LOGO_URL = 'https://www.kmmotos.com/cdn/shop/files/Logo-1.png?v=1696955196&width=500';

export default function SplashScreen() {
	const router = useRouter();

	useEffect(() => {
		const checkSession = async () => {
			const { data, error } = await supabase.auth.getSession();
			if (data?.session) {
				router.replace('/'); // Home principal
			} else {
				router.replace('/onboarding');
			}
		};
		checkSession();
	}, []);

	return (
		<View style={styles.container}>
			<Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
			<ActivityIndicator size="large" color="#3CB043" style={{ marginTop: 32 }} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#111',
		alignItems: 'center',
		justifyContent: 'center',
	},
	logo: {
		width: 200,
		height: 80,
	},
});
