import { NextApiRequest, NextApiResponse } from 'next';
import { StorageType } from '@/utils/storage';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get preference from cookies
    const storagePref = req.cookies.storagePreference as StorageType;
    
    // Default to local if no preference is found
    return res.status(200).json({ type: storagePref || 'local' });
  } catch (error) {
    console.error('Error reading storage preference:', error);
    return res.status(500).json({ error: 'Failed to get storage preference' });
  }
}