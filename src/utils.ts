import CryptoJS from 'crypto-js'

/**
 * Create and return an encryption seed for use in the secret client
 */
function createEncryptionSeed(password: string) {
  // generate hash of the password
  const hash = CryptoJS.SHA256(password).toString();
  // Encode the seed as UTF-8
  const encoder = new TextEncoder();
  const encodedSeed = encoder.encode(hash);
  // return Uint8Array of length 32
  return encodedSeed.subarray(0, 32);
}

export {
  createEncryptionSeed
}