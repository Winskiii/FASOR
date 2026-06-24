export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
export const MAX_FILE_SIZE_MB = 5

export const validateFile = (file: File): { isValid: boolean; errorMsg?: string } => {
	const fileSizeMB = file.size / (1024 * 1024)
	if (fileSizeMB > MAX_FILE_SIZE_MB) {
		return { isValid: false, errorMsg: `Ukuran file maksimal adalah ${MAX_FILE_SIZE_MB}MB.` }
	}

	if (!ALLOWED_MIME_TYPES.includes(file.type)) {
		return { isValid: false, errorMsg: 'Format file tidak didukung. Harap unggah JPG, PNG, atau PDF.' }
	}

	const dangerousExtensions = ['.php', '.sh', '.exe', '.bat', '.js']
	const fileNameLower = file.name.toLowerCase()
	if (dangerousExtensions.some(ext => fileNameLower.endsWith(ext))) {
		return { isValid: false, errorMsg: 'File terindikasi berbahaya dan ditolak.' }
	}

	return { isValid: true }
}
