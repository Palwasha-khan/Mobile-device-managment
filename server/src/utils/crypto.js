import crypto from "crypto";

export const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
};

export const comparePassword = (password, storedHash) => {
  return new Promise((resolve, reject) => {
    const [salt, key] = storedHash.split(":");
    const keyBuffer = Buffer.from(key, "hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      // timingSafeEqual prevents timing-attack-based guessing, unlike
      // a plain === comparison
      resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
    });
  });
};

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};