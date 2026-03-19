import { Client, Databases, Account } from 'appwrite';

const client = new Client();

client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT!)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID!);

// If you have an API Key (optional, for server-side style security)
if (import.meta.env.VITE_APPWRITE_API_KEY) {
    client.setKey(import.meta.env.VITE_APPWRITE_API_KEY);
}

export const databases = new Databases(client);
export const account = new Account(client);
export { client };

// Remember to create a .env.local file in the root of your project with:
// VITE_APPWRITE_ENDPOINT="[YOUR_APPWRITE_ENDPOINT]"
// VITE_APPWRITE_PROJECT_ID="[YOUR_APPWRITE_PROJECT_ID]"
// These values can be found in your Appwrite console under Project Settings.
