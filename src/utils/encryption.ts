/**
 * 加密工具模块
 * 使用 AES-256-GCM 加密数据，RSA-2048 加密密钥
 * 基于 Web Crypto API 实现
 */

import { fetchGetPublicKey } from '@/service/api';

/** 加密配置 */
interface EncryptionConfig {
  enabled: boolean;
  publicKey?: string;
  algorithm?: string;
}

/** 缓存的加密配置 */
let cachedConfig: EncryptionConfig | null = null;

/**
 * 初始化加密配置
 * 从后端获取公钥并缓存
 */
export async function initEncryption(): Promise<EncryptionConfig> {
  try {
    const { data: response, error } = await fetchGetPublicKey();

    if (error || !response) {
      // 获取失败时默认禁用加密
      cachedConfig = { enabled: false };
      return cachedConfig;
    }

    cachedConfig = {
      enabled: response.enabled ?? false,
      publicKey: response.publicKey,
      algorithm: response.algorithm
    };
    return cachedConfig;
  } catch {
    // 获取失败时默认禁用加密
    cachedConfig = { enabled: false };
    return cachedConfig;
  }
}

/**
 * 获取当前加密配置
 */
export function getEncryptionConfig(): EncryptionConfig {
  return cachedConfig ?? { enabled: false };
}

/**
 * 检查加密是否启用
 */
export function isEncryptionEnabled(): boolean {
  return cachedConfig?.enabled ?? false;
}

/**
 * 生成随机 AES 密钥（32字节 = 256位）
 */
async function generateAESKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true, // 可导出
    ['encrypt', 'decrypt']
  );
}

/**
 * 生成随机 Nonce（12字节 = 96位，AES-GCM 推荐）
 */
function generateNonce(): Uint8Array {
  return window.crypto.getRandomValues(new Uint8Array(12));
}

/**
 * 将 PEM 格式公钥转换为 CryptoKey
 */
async function importRSAPublicKey(pemKey: string): Promise<CryptoKey> {
  // 移除 PEM 头尾和换行
  const pemContents = pemKey
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\s/g, '');

  // Base64 解码为 ArrayBuffer
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  return await window.crypto.subtle.importKey(
    'spki',
    binaryKey,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256'
    },
    false,
    ['encrypt']
  );
}

/**
 * AES-GCM 加密数据
 */
async function encryptAESGCM(key: CryptoKey, data: Uint8Array, nonce: Uint8Array): Promise<Uint8Array> {
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce.buffer as ArrayBuffer,
      tagLength: 128 // 16字节认证标签
    },
    key,
    data.buffer as ArrayBuffer
  );
  return new Uint8Array(encrypted);
}

/**
 * RSA-OAEP 加密 AES 密钥
 */
async function encryptRSA(publicKey: CryptoKey, data: Uint8Array): Promise<Uint8Array> {
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    publicKey,
    data.buffer as ArrayBuffer
  );
  return new Uint8Array(encrypted);
}

/**
 * 导出 AES 密钥为原始字节
 */
async function exportAESKeyRaw(key: CryptoKey): Promise<Uint8Array> {
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return new Uint8Array(exported);
}

/**
 * Uint8Array 转 Base64
 */
function arrayToBase64(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr));
}

/**
 * Base64 转 Uint8Array
 */
function base64ToArray(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

/**
 * 加密请求数据
 * 返回加密后的数据结构
 */
export async function encryptRequestData(data: unknown): Promise<Api.Auth.EncryptionPayload | null> {
  // 检查加密是否启用
  if (!isEncryptionEnabled() || !cachedConfig?.publicKey) {
    return null;
  }

  try {
    // 1. 将数据转为 JSON 字符串
    const jsonData = JSON.stringify(data);
    const dataBytes = new TextEncoder().encode(jsonData);

    // 2. 生成 AES 密钥和 Nonce
    const aesKey = await generateAESKey();
    const nonce = generateNonce();

    // 3. AES-GCM 加密数据
    const encryptedData = await encryptAESGCM(aesKey, dataBytes, nonce);

    // 4. 导出 AES 密钥并用 RSA 加密
    const aesKeyRaw = await exportAESKeyRaw(aesKey);
    const rsaPublicKey = await importRSAPublicKey(cachedConfig.publicKey);
    const encryptedKey = await encryptRSA(rsaPublicKey, aesKeyRaw);

    // 5. 返回加密结构（Base64 编码）
    return {
      encryptedData: arrayToBase64(encryptedData),
      encryptedKey: arrayToBase64(encryptedKey),
      nonce: arrayToBase64(nonce)
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

/**
 * AES-GCM 解密数据（用于响应解密）
 */
export async function decryptAESGCMData(
  keyBytes: Uint8Array,
  encryptedData: Uint8Array,
  nonce: Uint8Array
): Promise<string> {
  // 导入 AES 密钥
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['decrypt']
  );

  // 解密
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonce.buffer as ArrayBuffer,
      tagLength: 128
    },
    key,
    encryptedData.buffer as ArrayBuffer
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * 从加密响应中解析数据
 */
export async function decryptResponseData(payload: { encryptedData: string; nonce: string }): Promise<unknown> {
  const encryptedBytes = base64ToArray(payload.encryptedData);
  // nonce will be used when AES decryption is implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _nonce = base64ToArray(payload.nonce);

  // 注意：响应解密需要后端返回 AES 密钥
  // 这里假设后端在同一会话中保持 AES 密钥关联
  // 实际实现可能需要更复杂的密钥管理

  // 暂时返回原始 JSON 解析（待完整实现）
  const decryptedText = new TextDecoder().decode(encryptedBytes);
  return JSON.parse(decryptedText);
}

/**
 * 清除加密缓存（用于重新初始化）
 */
export function clearEncryptionCache(): void {
  cachedConfig = null;
}
