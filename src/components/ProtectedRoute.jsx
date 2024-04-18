import {Navigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";



// The idea here is to prevent access to routes that require authorization

function ProtectedRoute({children}) {
	const [isAuthorized, setIsAuthorized] = useState(null);

	useEffect(() => {
		auth().catch(() => setIsAuthorized(false))
	}, [])

	const refreshToken = async () => {
		const refreshToken = localStorage.getItem(REFRESH_TOKEN);
		try {
			// This automatically uses the baseURL from api.js
			const res = await api.post("/api/token/refresh/", {
				refresh: refreshToken,
			});
			if (res.status === 200) {
				localStorage.setItem(ACCESS_TOKEN. res.data.access)
				setIsAuthorized(true);
			} else {
				setIsAuthorized(false);
			}
		} catch (error) {
			console.log(error)
			setIsAuthorized(false);
		}
	}

	const auth = async () => {
		const token = localStorage.getItem(ACCESS_TOKEN);

		if (!token) {
			setIsAuthorized(false);
			return;
		}

		const decoded = jwtDecode(token);
		const tokenExpiration = decoded.exp;
		// By default this is in miliseconds, we change to seconds
		const now = Date.now() / 1000;
		if (tokenExpiration < now) {
			await refreshToken()
		} else {
			setIsAuthorized(true);
		}

	}

	if (isAuthorized === null) {
		return <div>Loading...</div>;
	}


	// This should take us automatically to the page if it is authorized and
	// to login if not
	return isAuthorized ? children : <Navigate to="/login" />;
}



export default ProtectedRoute;

