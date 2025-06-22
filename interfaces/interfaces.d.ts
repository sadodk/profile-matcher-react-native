export interface Movie {
	id: number;
	title: string;
	adult: boolean;
	backdrop_path: string;
	genre_ids: number[];
	original_language: string;
	original_title: string;
	overview: string;
	popularity: number;
	poster_path: string;
	release_date: string;
	video: boolean;
	vote_average: number;
	vote_count: number;
}

export interface TrendingMovie {
	searchTerm: string;
	movie_id: number;
	title: string;
	count: number;
	poster_url: string;
}

export interface MovieDetails {
	adult: boolean;
	backdrop_path: string | null;
	belongs_to_collection: {
		id: number;
		name: string;
		poster_path: string;
		backdrop_path: string;
	} | null;
	budget: number;
	genres: {
		id: number;
		name: string;
	}[];
	homepage: string | null;
	id: number;
	imdb_id: string | null;
	original_language: string;
	original_title: string;
	overview: string | null;
	popularity: number;
}

export interface TrendingCardProps {
	// ...
}
