import { Eip1193Provider } from 'ethers';

interface ExtendedEip1193Provider extends Eip1193Provider {
  isBrave: boolean,
}

type WalletSigner = {
  signer: any,
  encryptionSeed?: Uint8Array,
  encryptionUtils?: any,
}

declare global {
  interface Window {
    ethereum: ExtendedEip1193Provider
  }
}

export {
  WalletSigner,
}