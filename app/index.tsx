import { Text, View } from 'react-native';
import AuthScreen from './components/AuthScreen';

export default function Index() {
	return (
		<View
			style={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Text>Welcome</Text>
			<AuthScreen />
		</View>
	);
}
