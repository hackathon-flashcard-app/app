import { useState, useEffect, useRef } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { useSession } from 'next-auth/react';
import UserNav from '@/components/UserNav';
import StorageSelector from '@/components/StorageSelector';
import { getStorageType, StorageType, saveToFile, saveLastEditedContent, getLastEditedContent, saveToDrive, getFromDrive } from '@/utils/storage';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export default function Home() {
	const { data: session } = useSession();
	const [storageType, setStorageType] = useState<StorageType>('file');
	const [demoData, setDemoData] = useState<string>('');
	const [fileName, setFileName] = useState<string>('data.json');
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		// Load storage preference on component mount
		const currentType = getStorageType();
		setStorageType(currentType);
		
		// Load initial content from local storage
		const savedContent = getLastEditedContent();
		if (savedContent) {
			setDemoData(savedContent);
		}
	}, []);

	// Auto-save content to localStorage when it changes
	useEffect(() => {
		saveLastEditedContent(demoData);
	}, [demoData]);

	const loadFromGoogleDrive = async () => {
		if (!session?.accessToken) {
			alert('Please sign in with Google to access Drive storage');
			return;
		}
		
		try {
			const data = await getFromDrive(`${fileName}.json`, session.accessToken as string);
			if (data) {
				setDemoData(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
			}
		} catch (error) {
			console.error('Error loading from Google Drive:', error);
			alert('Failed to load data from Google Drive');
		}
	};

	const saveData = async () => {
		try {
			// For file storage - download the file
			if (storageType === 'file') {
				saveToFile(demoData, fileName);
				return;
			}
			
			// For Google Drive
			if (storageType === 'google') {
				if (!session?.accessToken) {
					alert('Please sign in with Google to save to Drive');
					return;
				}
				
				const success = await saveToDrive(`${fileName}.json`, demoData, session.accessToken as string);
				if (success) {
					alert('Saved to Google Drive!');
				} else {
					throw new Error('Failed to save to Google Drive');
				}
			}
		} catch (error: any) {
			console.error('Error saving data:', error);
			alert(error.message || 'Failed to save data');
		}
	};

	const handleStorageChange = (type: StorageType) => {
		setStorageType(type);
		
		// Load data from Google Drive if switching to Google Drive
		if (type === 'google' && session?.accessToken) {
			loadFromGoogleDrive();
		}
	};
	
	const handleFileNameChange = (newFileName: string) => {
		setFileName(newFileName);
	};
	
	const handleImportLocalFile = () => {
		fileInputRef.current?.click();
	};
	
	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) return;
		
		const file = files[0];
		
		// Check if file is JSON
		if (!file.name.endsWith('.json')) {
			alert('Please select a JSON file');
			return;
		}
		
		// Set the filename based on the imported file (without extension)
		const baseName = file.name.replace(/\.json$/, '');
		setFileName(baseName);
		
		// Read file content
		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const content = e.target?.result as string;
				setDemoData(content);
				saveLastEditedContent(content);
			} catch (error) {
				console.error('Error parsing file content:', error);
				alert('Failed to read file. Make sure it is a valid JSON file.');
			}
		};
		reader.onerror = () => {
			console.error('Error reading file');
			alert('Failed to read file');
		};
		reader.readAsText(file);
		
		// Reset the input so the same file can be selected again
		event.target.value = '';
	};

	return (
		<div className={`grid grid-rows-[auto_1fr_auto] min-h-screen p-8 gap-8 sm:p-20 ${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)]`}>
			<header className="flex justify-between items-center w-full">
				<UserNav />
			</header>

			<main className="flex flex-col items-center w-full max-w-3xl mx-auto">
				<h1 className="text-2xl font-bold mb-6 text-center">Next.js App with Storage Options</h1>

				<StorageSelector 
					onStorageChange={handleStorageChange} 
					onFileNameChange={handleFileNameChange}
				/>

				<div className="w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
					<h2 className="text-xl font-semibold mb-4">Edit JSON Data</h2>
					<p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
						Edit your JSON data below and click save to download or store it.
					</p>

					<textarea
						value={demoData}
						onChange={(e) => setDemoData(e.target.value)}
						className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 min-h-[300px] mb-4 font-mono"
						placeholder="Enter JSON data here..."
					/>

					<div className="flex flex-wrap gap-2">
						{/* Save button */}
						<button
							onClick={saveData}
							className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
						>
							{storageType === 'file' ? `Download ${fileName}.json` : `Save to Drive as ${fileName}.json`}
						</button>
						
						{/* Import from local file button */}
						<button
							onClick={handleImportLocalFile}
							className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
						>
							Import from File
						</button>
						
						{/* Google Drive load button */}
						{storageType === 'google' && session && (
							<button
								onClick={loadFromGoogleDrive}
								className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
							>
								Load from Drive
							</button>
						)}
						
						{/* Hidden file input for import */}
						<input 
							type="file"
							ref={fileInputRef}
							onChange={handleFileSelect}
							style={{ display: 'none' }}
							accept=".json"
						/>
					</div>
				</div>
			</main>

			<footer className="flex gap-[24px] flex-wrap items-center justify-center text-sm text-gray-600 dark:text-gray-400">
				<p>Currently using: {
					storageType === 'file' 
						? 'Local File' 
						: 'Google Drive'
				}</p>
			</footer>
		</div>
	);
}