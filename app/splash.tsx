
import React, { useEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function SplashScreen() {
	const router = useRouter();

	useEffect(() => {
		const checkSession = async () => {
			try {
				const { data, error } = await supabase.auth.getSession();
				
				// Delay mínimo para mostrar splash
				await new Promise(resolve => setTimeout(resolve, 2000));
				
				if (data?.session) {
					router.replace('/(tabs)');
				} else {
					router.replace('/onboarding');
				}
			} catch (error) {
				console.error('Error checking session:', error);
				router.replace('/onboarding');
			}
		};
		
		checkSession();
	}, []);

	return (
		<View style={styles.container}>
			<View style={styles.logoContainer}>
				<View style={styles.logoBox}>
					<View style={styles.logoText}>
						<View style={styles.kmText} />
						<View style={styles.motosText} />
					</View>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000000',
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoContainer: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	logoBox: {
		width: 120,
		height: 60,
		backgroundColor: '#3CB043',
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 20,
	},
	logoText: {
		alignItems: 'center',
	},
	kmText: {
		width: 80,
		height: 20,
		backgroundColor: '#FFFFFF',
		marginBottom: 4,
		borderRadius: 2,
	},
	motosText: {
		width: 60,
		height: 12,
		backgroundColor: '#FFFFFF',
		borderRadius: 2,
	},
});
