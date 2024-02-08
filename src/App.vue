<script setup lang="ts">
import { 
  requestMetamaskAccounts$,
  getMetamaskSecretAddress$,
  getMetamaskSecretWalletSigner$
 } from '@/metamask';
import { ref } from 'vue';
import { SecretNetworkClient } from 'secretjs';
import { createEncryptionSeed } from './utils';
import { MsgExecuteContract } from 'secretjs';

const searchUserAddress = ref('secret1zezfylvuxkz3qz4qvz3c5yjj3g2xw7epwp06nf')
const secretAddress = ref('')
const getBalanceResponse = ref()
const getPublicBalanceResponse = ref()
const txHash = ref('');
const txData = ref();
const searchViewingKey = ref('')
const clientStatus = ref('')
const newViewingKey = ref('')

const SHD_ADDRESS = "secret13w6n5u3kpvqdunkavgfy40d7ma85xuhxrcxd0a"
const SHD_CODE_HASH = "31cbe386f9b8f04994a7f3fa097ce52b713527da235f22658aa2ba413138dc5f"

const secretQueryClient = new SecretNetworkClient({
    url: "https://lcd.testnet.secretsaturn.net/",
    chainId: "pulsar-3",
  })

async function queryBalance() {
  getBalanceResponse.value = await secretQueryClient.query.compute.queryContract({
    contract_address: SHD_ADDRESS, 
    code_hash: SHD_CODE_HASH,
    query: {
        balance: {
          address: searchUserAddress.value,
          key: searchViewingKey.value,
        },
      } 
  })

}

async function getPublicBalances() {
  getPublicBalanceResponse.value = await secretQueryClient.query.bank.allBalances({address: searchUserAddress.value})
}

function approve() {
  requestMetamaskAccounts$().subscribe();
}

function getAddress() {
  getMetamaskSecretAddress$().subscribe({
    next: (address) => {
      secretAddress.value = address;

    }
  })
}

let metamaskSigner: any;

function createSigningClient() {
  getMetamaskSecretWalletSigner$().subscribe({
    next: ({signer}) => {
      metamaskSigner = signer;
      clientStatus.value ="ready";
    }
  })
}

async function createViewingKey() {

  const secretSigningClient = new SecretNetworkClient({
    url: "https://lcd.testnet.secretsaturn.net/",
    chainId: "pulsar-3",
    wallet: metamaskSigner,
    walletAddress: secretAddress.value,
    encryptionSeed: createEncryptionSeed("RANDOM_STRING")
  })

  const viewingKeyMsg = { set_viewing_key: { key: newViewingKey.value } }

  const msg = new MsgExecuteContract({
    sender: secretAddress.value, 
    contract_address: SHD_ADDRESS,
    code_hash: SHD_CODE_HASH,
    msg: viewingKeyMsg,
  });

 const response = await secretSigningClient.tx.broadcast([msg], {
    gasLimit: 250000
  })
  console.log(response)

  txHash.value = response.transactionHash
}

async function getTxData() {


  const secretSigningClient = new SecretNetworkClient({
    url: "https://lcd.testnet.secretsaturn.net/",
    chainId: "pulsar-3",
    wallet: metamaskSigner,
    walletAddress: secretAddress.value,
    encryptionSeed: createEncryptionSeed("RANDOM_STRING")
  })

 txData.value = await secretSigningClient.query.getTx(txHash.value);
}


</script>
<template>
<div class="container">
  <h1> Hack Secret Demo</h1>
  Search address
  <input type="text" v-model="searchUserAddress" placeholder="Search Address" style="width: 500px">
  <button @click="getPublicBalances" class="btn">
    get public balances
  </button>
  {{ getPublicBalanceResponse }}

  
  <input type="text" v-model="searchViewingKey" placeholder="Enter SHD Viewing Key" style="width: 500px">
  <button @click="queryBalance" class="btn">
    query SHD Balance
  </button>
  {{ getBalanceResponse }}


  <div class="spacer"></div>
  <button @click="approve" class="btn">
    approve metamask connection (1 time setup)
  </button>


  <div class="spacer"></div>
  <button @click="getAddress" class="btn">
    get Secret Address
  </button>
  {{ secretAddress }}


  <div class="spacer"></div>
  <button @click="createSigningClient" class="btn">
    create Signing Client
  </button>
  {{ clientStatus }}


  <div class="spacer"></div>
  <input type="text" v-model="newViewingKey" placeholder="Enter New Viewing Key" style="width: 500px">
  <button @click="createViewingKey" class="btn">
    create Viewing Key
  </button>
  {{ txHash }}


  <div class="spacer"></div>
  <button @click="getTxData" class="btn">
    get Tx Data
  </button>
  {{ txData }}
</div>
</template>
<style lang='scss'>
  .container {
    display: flex;
    flex-direction: column;
  }
  .btn {
    width: 200px;
    margin-bottom: 10px;
  }

  .spacer{
    height: 20px;
  }
</style>


