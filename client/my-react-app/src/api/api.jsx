import axios from "axios";

const API_BASE = "http://127.0.0.1:5000/api";


export const getHistory = () => axios.get(`${API_BASE}/historical-data`);
export const getPrices = () => axios.get(`${API_BASE}/prices`);
export const getChangePoint = () => axios.get(`${API_BASE}/change-point`);
export const getEvents = () => axios.get(`${API_BASE}/events`);
export const getSummary = () => axios.get(`${API_BASE}/summary`);
export const getAllEvent = () => axios.get(`${API_BASE}/events-data`);
