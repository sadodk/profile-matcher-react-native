import MovieCard from '@/components/MovieCard';
import SearchBar from '@/components/SearchBar';
import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { useRouter } from 'expo-router';
import {
	ActivityIndicator,
	FlatList,
	Image,
	ScrollView,
	Text,
	View,
} from 'react-native';
import { fetchMovies } from '../api/api_imdb';
import useFetch from '../api/useFetch';

export default function Index() {
	const router = useRouter();

	const {
		data: movies,
		loading: moviesLoading,
		error: moviesError,
	} = useFetch(() => fetchMovies({ query: '' }));
	// We are passing the fetchMovies function to our custom hook useFetch with an empty query to get the latest movies
	return (
		<View className="flex-1 bg-primary">
			<Image
				source={images.bg}
				className="absolute z-0 w-full h-full"
				resizeMode="cover"
			/>
			{/* <Link href="/components/auth/AuthScreen" className="text-blue-500 mt-4">
				Authentication
			</Link> */}
			<ScrollView
				className="flex-1 px-5" // This ScrollView currently only contains the logo
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ minHeight: '100%', paddingBottom: 10 }}
			>
				<Image source={icons.logo} className="w-12 h-10 mt-20 mb-5 mx-auto" />

				{/* If SearchBar and movie list should scroll, move the conditional block below inside this ScrollView */}
			</ScrollView>

			{/* This block is currently outside the ScrollView */}
			{moviesLoading ? (
				<ActivityIndicator
					size="large"
					color="#0000ff"
					className="mt-10 self-center"
				/>
			) : moviesError ? (
				<View className="flex-1 justify-center items-center px-5">
					<Text className="text-white text-center">
						Error loading movies: {moviesError?.message}
					</Text>
					{/* You could add a retry button here */}
				</View>
			) : (
				// This is the success case (not loading, no error)
				// It's wrapped in a Fragment <> to return a single element
				<>
					<View className="px-5 mt-5">
						<SearchBar
							onPress={() => router.push('/search')}
							placeholder="Search for a movie"
						/>
					</View>
					<View className="px-5">
						<Text className="text-lg text-white font-bold mt-5 mb-3">
							{/* Add a title here, e.g., "Trending Movies" or based on `movies` data */}
							Latest Movies
						</Text>
						{/* You would typically map over the `movies` data here to display them */}
						<FlatList
							data={movies} // Adjust based on your API response structure
							renderItem={(
								{ item } // notice its a immmediate return because of the () parentheses
							) => <MovieCard {...item} />}
							keyExtractor={(item) => item.id.toString()}
							numColumns={3}
							columnWrapperStyle={{
								justifyContent: 'flex-start',
								gap: 20,
								paddingRight: 5,
								marginBottom: 10,
							}}
							className="mt-2 pb-32"
							scrollEnabled={false} // Disable scrolling for FlatList
						/>
						{/* Example:
						<FlatList
							data={movies?.results} // Adjust based on your API response structure
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => (
								<View>
									<Text className="text-white">{item.title}</Text>
								</View>
							)}
						/>
						*/}
					</View>
				</>
			)}
		</View>
	);
}
