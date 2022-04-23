import CryptoJS from 'crypto-js'
import sha256 from 'crypto-js/sha256'

export function checkBase58 (address) {
  if (!/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return false
  const bufferLength = 25
  let buffer = new Uint8Array(bufferLength)
  const digits58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  for (var i = 0; i < address.length; i++) {
    const num = digits58.indexOf(address[i])
    // buffer = buffer * 58 + num
    let carry = 0
    for (var j = bufferLength - 1; j >= 0; --j) {
      // num < 256, so we just add it to last
      const result = buffer[j] * 58 + carry + (j === bufferLength - 1 ? num : 0)
      buffer[j] = result % (1 << 8)
      carry = Math.floor(result / (1 << 8))
    }
  }
  // check whether sha256(sha256(buffer[:-4]))[:4] === buffer[-4:]
  const hashedWords1 = sha256(CryptoJS.lib.WordArray.create(buffer.slice(0, 21)))
  const hashedWords = sha256(hashedWords1).words
  // get buffer[-4:] with big-endian
  const lastWordAddress = new DataView(buffer.slice(-4).buffer).getInt32(0, false)
  const expectedLastWord = hashedWords[0]
  return lastWordAddress === expectedLastWord
}


