import axios from 'axios';

export const API_KEY = '5a917d25f7c40ac92b4317c99a46600d';
const BASE_URL = 'https://api.themoviedb.org/3';

// export const fetchMovies = async (endpoint) => {
//   const res = await axios.get(`${BASE_URL}/movie/${endpoint}?api_key=${API_KEY}`);
//   return res.data.results;
// };

// export const fetchTVShows = async (endpoint) => {
//   const res = await axios.get(`${BASE_URL}/tv/${endpoint}?api_key=${API_KEY}`);
//   return res.data.results;
// };

// export const fetchMovieDetails = async (id) => {
//   const res = await axios.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
//   return res.data;
// };

// export const fetchTVShowDetails = async (id) => {
//   const res = await axios.get(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
//   return res.data;
// };
