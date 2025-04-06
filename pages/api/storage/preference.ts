import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type } = req.body;
    
    if (type !== 'local' && type !== 'google') {
      return res.status(400).json({ error: 'Invalid storage type' });
    }
    
    // Set a cookie to persist the preference
    res.setHeader('Set-Cookie', `storagePreference=${type}; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000`);
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error saving storage preference:', error);
    return res.status(500).json({ error: 'Failed to save preference' });
  }
}