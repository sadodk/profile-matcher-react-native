import SearchBar from '@/components/SearchBar';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { useRouter } from 'expo-router';
import { Image, ScrollView, View } from 'react-native';
export default function Index() {
	const router = useRouter();
	return (
		<View className="flex-1 bg-primary">
			<Image source={images.bg} className="absolute z-0 w-full" />
			{/* <Link href="/components/auth/AuthScreen" className="text-blue-500 mt-4">
				Authentication
			</Link> */}
			<ScrollView
				className="flex-1 px-5"
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ minHeight: '100%', paddingBottom: 10 }}
			>
				<Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />
			</ScrollView>
			<View className="flex-1 mt-5">
				<SearchBar
					onPress={() => router.push('/search')}
					placeholder="Search for a movie"
				/>
			</View>
		</View>
	);
}
