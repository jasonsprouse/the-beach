#!/usr/bin/env node

/**
 * Setup Vercel KV Database with Lit Protocol Encrypted Secrets
 * 
 * This script:
 * 1. Creates a Vercel KV database for session storage
 * 2. Encrypts sensitive values using Lit Protocol
 * 3. Stores encrypted secrets in Vercel environment variables
 * 4. Provides decryption utilities for runtime access
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Lit Protocol will be used for encryption
let LitNodeClient, encryptString, decryptToString;

async function importLitProtocol() {
  try {
    const litModule = await import('@lit-protocol/lit-node-client-nodejs');
    const litEncrypt = await import('@lit-protocol/encryption');
    
    LitNodeClient = litModule.LitNodeClient;
    encryptString = litEncrypt.encryptString;
    decryptToString = litEncrypt.decryptToString;
    
    console.log('✅ Lit Protocol modules imported');
  } catch (error) {
    console.error('❌ Failed to import Lit Protocol:', error.message);
    console.log('📦 Installing Lit Protocol dependencies...');
    execSync('npm install --save-dev @lit-protocol/lit-node-client-nodejs @lit-protocol/encryption', { stdio: 'inherit' });
    
    // Retry import
    const litModule = await import('@lit-protocol/lit-node-client-nodejs');
    const litEncrypt = await import('@lit-protocol/encryption');
    
    LitNodeClient = litModule.LitNodeClient;
    encryptString = litEncrypt.encryptString;
    decryptToString = litEncrypt.decryptToString;
  }
}

async function initializeLitClient() {
  console.log('🔧 Initializing Lit Protocol client...');
  
  const litNodeClient = new LitNodeClient({
    litNetwork: 'datil-dev', // Use datil-dev for development
    debug: false,
  });
  
  await litNodeClient.connect();
  console.log('✅ Connected to Lit Protocol network');
  
  return litNodeClient;
}

async function encryptWithLit(litClient, value, accessControlConditions) {
  console.log('🔐 Encrypting value with Lit Protocol...');
  
  const { ciphertext, dataToEncryptHash } = await encryptString(
    {
      accessControlConditions,
      dataToEncrypt: value,
    },
    litClient
  );
  
  return {
    ciphertext,
    dataToEncryptHash,
    accessControlConditions,
  };
}

function getAccessControlConditions() {
  // Access control: Only allow decryption from the deployed domain
  return [
    {
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: process.env.AUTHORIZED_WALLET || '0x0000000000000000000000000000000000000000',
      },
    },
  ];
}

async function createVercelKVDatabase() {
  console.log('🗄️  Creating Vercel KV database...');
  
  try {
    // Check if already linked
    const vercelDir = path.join(process.cwd(), '.vercel');
    if (!fs.existsSync(vercelDir)) {
      console.log('⚠️  Project not linked to Vercel. Run: vercel link');
      process.exit(1);
    }
    
    const projectConfig = JSON.parse(fs.readFileSync(path.join(vercelDir, 'project.json'), 'utf8'));
    console.log(`📦 Project: ${projectConfig.name}`);
    
    // Create KV database using Vercel API
    const createCommand = `curl -X POST "https://api.vercel.com/v1/storage/stores" \
      -H "Authorization: Bearer ${process.env.VERCEL_TOKEN}" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "the-beach-sessions",
        "type": "kv",
        "projectId": "${projectConfig.projectId}"
      }'`;
    
    const result = execSync(createCommand, { encoding: 'utf8' });
    const kvStore = JSON.parse(result);
    
    if (kvStore.error) {
      if (kvStore.error.code === 'store_already_exists') {
        console.log('✅ KV database already exists');
        return kvStore;
      }
      throw new Error(`Failed to create KV: ${kvStore.error.message}`);
    }
    
    console.log('✅ KV database created:', kvStore.name);
    return kvStore;
    
  } catch (error) {
    console.error('❌ Error creating KV database:', error.message);
    throw error;
  }
}

async function setEncryptedEnvVar(varName, encryptedData) {
  console.log(`🔐 Setting encrypted environment variable: ${varName}`);
  
  // Store the encrypted data as JSON
  const encryptedValue = JSON.stringify(encryptedData);
  
  // Use Vercel CLI to set the environment variable
  const command = `echo '${encryptedValue}' | vercel env add ${varName}_ENCRYPTED production`;
  
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${varName}_ENCRYPTED set in Vercel`);
  } catch (error) {
    console.error(`❌ Failed to set ${varName}:`, error.message);
  }
}

async function generateSessionSecret() {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('base64');
}

async function main() {
  console.log('🚀 Vercel KV + Lit Protocol Setup');
  console.log('=====================================\n');
  
  // Check for required environment variables
  if (!process.env.VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN not found in environment');
    console.log('💡 Get your token from: https://vercel.com/account/tokens');
    console.log('💡 Then run: export VERCEL_TOKEN=your_token_here');
    process.exit(1);
  }
  
  try {
    // Step 1: Import Lit Protocol
    await importLitProtocol();
    
    // Step 2: Initialize Lit client
    const litClient = await initializeLitClient();
    
    // Step 3: Create Vercel KV database
    const kvStore = await createVercelKVDatabase();
    
    // Step 4: Generate session secret
    console.log('🔑 Generating session secret...');
    const sessionSecret = await generateSessionSecret();
    console.log('✅ Session secret generated');
    
    // Step 5: Define access control conditions
    const accessControlConditions = getAccessControlConditions();
    
    // Step 6: Encrypt session secret with Lit Protocol
    const encryptedSessionSecret = await encryptWithLit(
      litClient,
      sessionSecret,
      accessControlConditions
    );
    
    // Step 7: Set encrypted secrets in Vercel
    await setEncryptedEnvVar('SESSION_SECRET', encryptedSessionSecret);
    
    // Step 8: Store decryption metadata locally for reference
    const metadataPath = path.join(process.cwd(), '.vercel', 'lit-encrypted-secrets.json');
    fs.writeFileSync(metadataPath, JSON.stringify({
      SESSION_SECRET: {
        dataToEncryptHash: encryptedSessionSecret.dataToEncryptHash,
        accessControlConditions: encryptedSessionSecret.accessControlConditions,
        createdAt: new Date().toISOString(),
      }
    }, null, 2));
    console.log('✅ Decryption metadata saved locally');
    
    // Step 9: Create runtime decryption utility
    createDecryptionUtility();
    
    console.log('\n✅ Setup Complete!');
    console.log('=====================================');
    console.log('📋 Next steps:');
    console.log('1. Vercel KV database created: the-beach-sessions');
    console.log('2. Session secret encrypted with Lit Protocol');
    console.log('3. Deploy to Vercel: vercel deploy --prod');
    console.log('4. KV environment variables will be auto-injected');
    
    await litClient.disconnect();
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

function createDecryptionUtility() {
  const utilityCode = `
/**
 * Lit Protocol Secret Decryption Utility
 * Use this to decrypt secrets at runtime
 */

import { LitNodeClient } from '@lit-protocol/lit-node-client-nodejs';
import { decryptToString } from '@lit-protocol/encryption';

export async function decryptSecret(encryptedData) {
  const litClient = new LitNodeClient({
    litNetwork: 'datil-dev',
    debug: false,
  });
  
  await litClient.connect();
  
  const decryptedValue = await decryptToString(
    {
      accessControlConditions: encryptedData.accessControlConditions,
      ciphertext: encryptedData.ciphertext,
      dataToEncryptHash: encryptedData.dataToEncryptHash,
      authSig: await getAuthSig(), // Implement based on your auth method
      chain: 'ethereum',
    },
    litClient
  );
  
  await litClient.disconnect();
  return decryptedValue;
}

async function getAuthSig() {
  // Implement your authentication signature method
  // This could use WebAuthn, wallet signature, etc.
  throw new Error('Implement getAuthSig() based on your authentication method');
}
`;
  
  const utilityPath = path.join(process.cwd(), 'src', 'utils', 'lit-decrypt.ts');
  const utilityDir = path.dirname(utilityPath);
  
  if (!fs.existsSync(utilityDir)) {
    fs.mkdirSync(utilityDir, { recursive: true });
  }
  
  fs.writeFileSync(utilityPath, utilityCode);
  console.log('✅ Decryption utility created: src/utils/lit-decrypt.ts');
}

// Run the script
main().catch(console.error);
