You can see everything as a comment in code.
Stage 1
Convert the key from hex string to byte array cause SHA256 works with byte arrays
```csharp 
byte[] keyBytes = Convert.FromHexString(keyHex);
```
Create a SHA256 instance to compute the hash
```csharp 
using var sha256 = SHA256.Create();
```

Compute the hash of the key bytes
```csharp 
byte[] hash = sha256.ComputeHash(keyBytes);
```

Convert the hash to a hex string and make it lowercase for comparison
```csharp 
string hashHex = Convert.ToHexString(hash).ToLower();
```


Stage 2

Method to decrypt the AES encrypted message using the correct key and IV
static string DecryptAES(byte[] encryptedMessage, byte[] key, byte[] iv) 
```csharp
AES configuration
using var aes = Aes.Create();
aes.KeySize = 128; 
aes.BlockSize = 128;
aes.Mode = CipherMode.CBC;
aes.Padding = PaddingMode.PKCS7;
aes.Key = key;
aes.IV = iv;
```
Decrypt
```csharp
byte[] decryptedBytes = decryptor.TransformFinalBlock(encryptedMessage, 0, encryptedMessage.Length);
```