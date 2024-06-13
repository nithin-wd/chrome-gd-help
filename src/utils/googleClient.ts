// File: /lib/googleClient.ts
import { google, sheets_v4, Auth } from "googleapis";

export const googleClient = (() => {
	const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!, process.env.GOOGLE_REDIRECT_URI!);

	async function refreshAccessToken(refreshToken: string): Promise<object> {
		oauth2Client.setCredentials({ refresh_token: refreshToken });
		const { credentials } = await oauth2Client.refreshAccessToken();
		if (!credentials.access_token) {
			// Handle the absence of an access token appropriately
			throw new Error("Failed to refresh access token");
		}
		const res = {access_token:credentials?.access_token,expiry_date:credentials?.expiry_date};
		// Update stored access token in your storage system here
		return res;
	}

	function isTokenExpired(expiryDate?: number): boolean {
		if (!expiryDate) {
			return true; // Assume expired if no expiry date is available
		}
		return Date.now() >= expiryDate;
	}

	return {
		sheets: google.sheets({ version: "v4", auth: oauth2Client }) as sheets_v4.Sheets,
		auth: oauth2Client as Auth.OAuth2Client,
		refreshAccessToken,
		isTokenExpired
	};
})();
