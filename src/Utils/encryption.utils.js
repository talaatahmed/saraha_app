import crypto from "node:crypto";
import fs from "node:fs";

// const EncryptionSecretKey = process.env.ENCRYPTION_SECRET_KEY;
const EncryptionSecretKey = Buffer.from(process.env.ENCRYPTION_SECRET_KEY); //32 bytes
const IV_LENGTH = +process.env.IV_LENGTH; // For AES, this is always 16

/*
create cipher
update cipher
final cipher
*/
export const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv("aes-256-cbc", EncryptionSecretKey, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

export const decrypt = (encryptedData) => {
  console.log("the encrypted data in decrypt function: ", encryptedData);

  const [iv, encryptedText] = encryptedData.split(":");
  const binaryLikeIv = Buffer.from(iv, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    EncryptionSecretKey,
    binaryLikeIv
  );
  let decryptedData = decipher.update(encryptedText, "hex", "utf8");
  decryptedData += decipher.final("utf8");
  return decryptedData;
};

/*
for Asymmetric Encryption and Decryption
Generate 2 keys (public, private)
public key to encrypt
private key to decrypt
*/

if (fs.existsSync("publickey.pem") && fs.existsSync("privatekey.pem")) {
  console.log("key is already genreated");
} else {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048, // the length of your key in bits
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });
  fs.writeFileSync("publickey.pem", publicKey);
  fs.writeFileSync("privatekey.pem", privateKey);
  // console.log("the public key: ", publicKey, "\n the private key: ", privateKey);
}

export const asymmetricEncryption = (text) => {
  const publicKey = fs.readFileSync("publickey.pem", "utf-8");
  const bufferredText = Buffer.from(text);
  const encryptedData = crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferredText
  );
  return encryptedData.toString("hex");
};

export const asymmetricDecryption = (text) => {
  const privateKey = fs.readFileSync("privatekey.pem", "utf-8");
  const bufferredText = Buffer.from(text, "hex");
  const decryptedData = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferredText
  );
  return decryptedData.toString("utf-8");
};
