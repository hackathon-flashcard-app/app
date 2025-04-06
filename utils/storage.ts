// Storage utility function for handling both file selection and Google Drive storage
import { promises as fs } from 'fs';

export type StorageType = 'google' | 'file';

// Get storage preference
export const getStorageType = (): StorageType => {
  if (typeof window === 'undefined') return 'file';
  return (localStorage.getItem('storagePreference') as StorageType) || 'file';
};

// File operations using downloaded File objects
export const saveToFile = (content: string, baseName: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // Always ensure we use .json extension
    const fileName = `${baseName.replace(/\.\w+$/, '')}.json`;
    
    // Create a blob with the JSON content
    const blob = new Blob([content], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
};

// Helper to save the last edited content in localStorage
export const saveLastEditedContent = (content: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('lastEditedContent', content);
  } catch (error) {
    console.error('Error saving last edited content:', error);
  }
};

export const getLastEditedContent = (): string => {
  if (typeof window === 'undefined') return '';
  
  try {
    return localStorage.getItem('lastEditedContent') || '';
  } catch (error) {
    console.error('Error getting last edited content:', error);
    return '';
  }
};

// Google Drive functions - these will use the access token from NextAuth session
export const saveToDrive = async (fileName: string, data: any, accessToken?: string): Promise<boolean> => {
  if (!accessToken) return false;

  try {
    // Simple check first to see if file exists
    const fileId = await checkFileExists(fileName, accessToken);

    const method = fileId ? 'PATCH' : 'POST';
    const url = fileId 
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media` 
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=media';

    const fileContent = JSON.stringify(data);

    // Upload file content
    const uploadResponse = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: fileContent,
    });

    if (!uploadResponse.ok) {
      console.log(uploadResponse.status)
      throw new Error(`Failed to save to Drive: ${uploadResponse.statusText}`);
    }

    // If it's a new file, update the metadata to name it
    if (!fileId) {
      const uploadResult = await uploadResponse.json();
      const newFileId = uploadResult.id;

      const metadataResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${newFileId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fileName,
        }),
      });

      if (!metadataResponse.ok) {
        throw new Error(`Failed to update file metadata: ${metadataResponse.statusText}`);
      }
    }

    return true;
  } catch (error) {
    console.error('Error saving to Drive:', error);
    return false;
  }
};

export const getFromDrive = async (fileName: string, accessToken?: string): Promise<any> => {
  if (!accessToken) return null;

  try {
    // First, find the file ID
    const fileId = await checkFileExists(fileName, accessToken);
    if (!fileId) return null;

    // Then download the file
    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get file from Drive: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting data from Drive:', error);
    return null;
  }
};

// Helper function to check if a file exists and return its ID
async function checkFileExists(fileName: string, accessToken: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${fileName}'`, 
        {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search Drive: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error checking if file exists:', error);
    return null;
  }
}