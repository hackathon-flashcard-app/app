import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { getFromDrive, saveToDrive } from '@/utils/storage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });
  
  try {
    const { key } = req.query;
    
    if (!key || Array.isArray(key)) {
      return res.status(400).json({ error: 'Invalid key parameter' });
    }
    
    // GET request
    if (req.method === 'GET') {
      const { storageType } = req.query;
      
      // Handle Google Drive requests
      if (storageType === 'google') {
        if (!session?.accessToken) {
          return res.status(401).json({ error: 'Authentication required for Google Drive storage' });
        }
        
        const data = await getFromDrive(`${key}.json`, session.accessToken as string);
        return res.status(200).json(data || null);
      }
      
      return res.status(400).json({ error: 'Invalid storage type' });
    }
    
    // POST request
    if (req.method === 'POST') {
      const { data, storageType } = req.body;
      
      if (data === undefined) {
        return res.status(400).json({ error: 'Missing data parameter' });
      }
      
      // Handle Google Drive requests
      if (storageType === 'google') {
        if (!session?.accessToken) {
          return res.status(401).json({ error: 'Authentication required for Google Drive storage' });
        }
        
        const success = await saveToDrive(`${key}.json`, data, session.accessToken as string);
        
        if (!success) {
          return res.status(500).json({ error: 'Failed to save to Google Drive' });
        }
        
        return res.status(200).json({ success: true });
      }
      
      return res.status(400).json({ error: 'Invalid storage type' });
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error handling storage request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
