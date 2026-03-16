export const loginWithGoogle = (onSuccess: (token: string) => void) => {
  if (window.google) {
    if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      alert("Please set VITE_GOOGLE_CLIENT_ID in your .env file to use Google Login.");
      return;
    }
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://mail.google.com/ https://www.googleapis.com/auth/gmail.settings.basic',
      callback: (response: any) => {
        if (response.access_token) {
          onSuccess(response.access_token);
        }
      },
    });
    client.requestAccessToken();
  } else {
    alert("Google Identity Services failed to load. Please check your internet connection and try again.");
  }
};
