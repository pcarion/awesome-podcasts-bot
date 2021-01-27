import { resolve } from 'path';
import { existsSync, readFileSync } from 'fs';

import isBase64 from 'is-base64';

type Options = {
  privateKey?: string;
  privateKeyPath?: string;
};

export default function getPrivateKey(options: Options = {}): string | undefined {
  if (options.privateKey) {
    const privateKey = isBase64(options.privateKey)
      ? Buffer.from(options.privateKey, 'base64').toString()
      : options.privateKey;

    const begin = '-----BEGIN RSA PRIVATE KEY-----';
    const end = '-----END RSA PRIVATE KEY-----';
    if (privateKey.includes(begin) && privateKey.includes(end)) {
      // Full key with new lines
      return privateKey.replace(/\\n/g, '\n');
    }

    throw new Error(
      `The contents of "privateKey" could not be validated. Please check to ensure you have copied the contents of the .pem file correctly.`,
    );
  }

  if (options.privateKeyPath) {
    const filepath = resolve('.', options.privateKeyPath);
    if (existsSync(filepath)) {
      return readFileSync(filepath, 'utf-8');
    } else {
      throw new Error(
        `Private key does not exists at path: "${options.privateKeyPath}". Please check to ensure that "env.PRIVATE_KEY_PATH" is correct.`,
      );
    }
  }
  return undefined;
}
