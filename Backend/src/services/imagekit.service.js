const ImageKit = require('@imagekit/nodejs');
const { toFile } = require('@imagekit/nodejs');

let client = null;

/**
 * Singleton ImageKit client — shared across all controllers.
 * Lazily initialized on first use.
 */
const getImageKitClient = () => {
    if (!client) {
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('IMAGEKIT_PRIVATE_KEY is not configured');
        }
        client = new ImageKit({
            privateKey,
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY || 'placeholder',
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/placeholder'
        });
    }
    return client;
};

/**
 * Upload a multer file buffer to ImageKit
 * @param {Object} multerFile - req.file from multer
 * @param {string} folder - ImageKit folder path
 * @param {string} prefix - Filename prefix (e.g. 'post', 'profile', 'story')
 * @returns {Promise<{url: string, fileId: string}>}
 */
const uploadToImageKit = async (multerFile, folder, prefix = 'file') => {
    const ik = getImageKitClient();
    const result = await ik.files.upload({
        file: await toFile(Buffer.from(multerFile.buffer), multerFile.originalname),
        fileName: `${prefix}_${Date.now()}`,
        folder: `social-nest/${folder}`,
    });
    return { url: result.url, fileId: result.fileId };
};

module.exports = { getImageKitClient, uploadToImageKit };
