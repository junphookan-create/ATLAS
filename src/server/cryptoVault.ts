import crypto from 'crypto';

const DEFAULT_MASTER_SECRET = process.env.VAULT_MASTER_KEY || 'atlas-ai-vault-master-secret-key-2026';
const DEFAULT_SALT = process.env.VAULT_SALT || 'atlas-ai-vault-salt-v1';

export class CryptoVault {
  private key: Buffer;
  private version: number = 1;
  private previousKeys: Map<number, Buffer> = new Map();

  constructor() {
    this.key = crypto.pbkdf2Sync(DEFAULT_MASTER_SECRET, DEFAULT_SALT, 100000, 32, 'sha256');
    this.previousKeys.set(1, this.key);
  }

  /**
   * Rotates master vault key dynamically
   */
  rotateKey(newSecret: string, newSalt: string): number {
    this.version += 1;
    const newKey = crypto.pbkdf2Sync(newSecret, newSalt, 100000, 32, 'sha256');
    this.previousKeys.set(this.version, newKey);
    this.key = newKey;
    return this.version;
  }

  /**
   * Encrypts plaintext payload using AES-256-GCM with Key Version
   */
  encrypt(text: string): { ciphertext: string; iv: string; tag: string; vaultVersion: number } {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      tag,
      vaultVersion: this.version,
    };
  }

  /**
   * Decrypts AES-256-GCM ciphertext using matching key version
   */
  decrypt(ciphertext: string, ivHex: string, tagHex: string, vaultVersion: number = 1): string {
    const targetKey = this.previousKeys.get(vaultVersion) || this.key;
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      targetKey,
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Computes HMAC-SHA256 signature for callbacks
   */
  signCallbackPayload(payload: any, secret: string = 'atlas-secret'): string {
    return crypto
      .createHmac('sha256', secret)
      .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
      .digest('hex');
  }

  /**
   * Hashes payload for SHA-256 audit log chaining
   */
  hashAuditEntry(previousHash: string, payloadStr: string, timestamp: string): string {
    return crypto
      .createHash('sha256')
      .update(`${previousHash}:${payloadStr}:${timestamp}`)
      .digest('hex');
  }

  getVaultVersion(): number {
    return this.version;
  }
}

export const cryptoVault = new CryptoVault();
