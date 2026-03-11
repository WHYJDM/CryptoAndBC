using System;
using System.Linq;
using System.Text;
using System.Security.Cryptography;


string[] keysInHex =
{
    "68544020247570407220244063724074",
    "54684020247570407220244063724074",
    "54684020247570407220244063727440"
};

string hexHashOfTheCorrectKey = "f28fe539655fd6f7275a09b7c3508a3f81573fc42827ce34ddf1ec8d5c2421c3";

string aes128EncryptedMessage = "876b4e970c3516f333bcf5f16d546a87aaeea5588ead29d213557efc1903997e";

string cbcIvHex = "656e6372797074696f6e496e74566563";


byte[] correctKey = null;
string correctKeyHex = "";
//1

foreach (var keyHex in keysInHex) // Loop through each key
{
    byte[] keyBytes = Convert.FromHexString(keyHex); // Convert the key from hex string to byte array cause SHA256 works with byte arrays
    using var sha256 = SHA256.Create(); // Create a SHA256 instance to compute the hash
    byte[] hash = sha256.ComputeHash(keyBytes); // Compute the hash of the key bytes
    string hashHex = Convert.ToHexString(hash).ToLower(); // Convert the hash to a hex string and make it lowercase for comparison

    if (hashHex == hexHashOfTheCorrectKey) // Compare 
    {
        correctKey = keyBytes;
        correctKeyHex = keyHex;
        break;
    }
}
if (correctKey != null)
{
    Console.WriteLine($"Correct key found: {correctKeyHex}");
}
else
{
    Console.WriteLine("No correct key found");
}

//2
static string DecryptAES(byte[] encryptedMessage, byte[] key, byte[] iv) // Method to decrypt the AES encrypted message using the correct key and IV
{
    using var aes = Aes.Create();
    aes.KeySize = 128; // aes 128, so 128 bits
    aes.BlockSize = 128;  // AES block size is always 128 bits
    aes.Mode = CipherMode.CBC;
    aes.Padding = PaddingMode.PKCS7;
    aes.Key = key;
    aes.IV = iv;
    using ICryptoTransform decryptor = aes.CreateDecryptor();
    byte[] decryptedBytes = decryptor.TransformFinalBlock(encryptedMessage, 0, encryptedMessage.Length);
    return Encoding.UTF8.GetString(decryptedBytes);
}


byte[] iv = Convert.FromHexString(cbcIvHex);
byte[] encryptedMessage = Convert.FromHexString(aes128EncryptedMessage);
string decryptedMessage = DecryptAES(encryptedMessage, correctKey, iv);
Console.WriteLine($"Decrypted message: {decryptedMessage}");


//3

using var ecdsa = ECDsa.Create(ECCurve.CreateFromFriendlyName("secP256k1"));

byte[] data = Encoding.UTF8.GetBytes(decryptedMessage);

byte[] signature = ecdsa.SignData(data, HashAlgorithmName.SHA256);

//4

Console.WriteLine("Public key:");
Console.WriteLine(Convert.ToBase64String(ecdsa.ExportSubjectPublicKeyInfo()));



//  Correct key found: 54684020247570407220244063724074
//  Decrypted message: Hello Blockchain!
//  Public key:
//  MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEkMcrk6Ili0B+4VKSpCXX5LkOluoNk3p+LkXK91AtclvT6PyzvGjzdtarimhReaASdA45e0HUCWIJ6NPRF47cHA==
