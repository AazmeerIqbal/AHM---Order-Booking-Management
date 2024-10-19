// utils/encryption.js
export function encrypt(sString) {
  let encryptedString = "";

  for (let i = 0; i < sString.length; i++) {
    let charCode = sString.charCodeAt(i);
    let encryptedCharCode = charCode ^ 13;
    encryptedString += String.fromCharCode(encryptedCharCode);
  }

  return encryptedString;
}

export function decrypt(encryptedString) {
  let decryptedString = "";

  for (let i = 0; i < encryptedString.length; i++) {
    let charCode = encryptedString.charCodeAt(i);
    let decryptedCharCode = charCode ^ 13;
    decryptedString += String.fromCharCode(decryptedCharCode);
  }

  return decryptedString;
}
