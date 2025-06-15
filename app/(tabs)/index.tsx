import { Link } from 'expo-router';
import { Text, View } from 'react-native';
export default function Index() {
	return (
		<View className="flex-1 justify-center items-center">
			<Text className="text-3xl text-primary font-bold">Welcome</Text>

			<Link href="/components/auth/AuthScreen" className="text-blue-500 mt-4">
				Authentication
			</Link>
			{/* <AuthScreen /> */}
		</View>
	);
}
