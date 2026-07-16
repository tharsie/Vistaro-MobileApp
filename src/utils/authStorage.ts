import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const memoryStorage = new Map<string, string>();

export async function setAuthItem(key: string, value: string) {
  try {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value);
  } catch {
    memoryStorage.set(key, value);
  }
}

export async function getAuthItem(key: string) {
  try {
    if (Platform.OS === 'web') {
      return window.localStorage.getItem(key);
    }

    return await SecureStore.getItemAsync(key);
  } catch {
    return memoryStorage.get(key) ?? null;
  }
}

export async function deleteAuthItem(key: string) {
  try {
    if (Platform.OS === 'web') {
      window.localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  } catch {
    memoryStorage.delete(key);
  }
}