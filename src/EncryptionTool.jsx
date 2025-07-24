import React, { useState } from "react";
import "./EncryptionTool.css";

const cipherInfo = {
  caesar: {
    name: "Caesar Cipher",
    description:
      "The Caesar cipher shifts each letter in the plaintext by a fixed number of positions down the alphabet. For example, with a shift of 3, A becomes D, B becomes E, etc.",
  },
  vigenere: {
    name: "Vigenère Cipher",
    description:
      "The Vigenère cipher uses a keyword to determine the shift for each letter. Each letter of the keyword corresponds to a shift value, creating a more complex encryption than Caesar cipher.",
  },
  railfence: {
    name: "Rail Fence Cipher",
    description:
      'The Rail Fence cipher writes the plaintext in a zigzag pattern across multiple "rails" or lines, then reads off the letters row by row to create the ciphertext.',
  },
  playfair: {
    name: "Playfair Cipher",
    description:
      "The Playfair cipher encrypts pairs of letters (digraphs) using a 5×5 square of letters built using a keyword. It follows specific rules for encryption based on letter positions.",
  },
};

// Caesar Cipher Implementation
function caesarCipher(text, shift, decrypt = false) {
  if (decrypt) shift = -shift;
  return text.replace(/[a-zA-Z]/g, function (char) {
    const start = char <= "Z" ? 65 : 97;
    return String.fromCharCode(
      ((char.charCodeAt(0) - start + shift + 26) % 26) + start
    );
  });
}

// Vigenère Cipher Implementation
function vigenereCipher(text, key, decrypt = false) {
  if (!key) return text;
  key = key.toUpperCase();
  let result = "";
  let keyIndex = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char.match(/[a-zA-Z]/)) {
      const start = char <= "Z" ? 65 : 97;
      const shift = key.charCodeAt(keyIndex % key.length) - 65;
      const finalShift = decrypt ? -shift : shift;
      result += String.fromCharCode(
        ((char.charCodeAt(0) - start + finalShift + 26) % 26) + start
      );
      keyIndex++;
    } else {
      result += char;
    }
  }
  return result;
}

// Rail Fence Cipher Implementation
function railFenceCipher(text, rails, decrypt = false) {
  if (rails <= 1) return text;

  if (decrypt) {
    return railFenceDecrypt(text, rails);
  }

  const fence = Array.from({ length: rails }, () => []);
  let rail = 0;
  let direction = 1;

  for (let i = 0; i < text.length; i++) {
    fence[rail].push(text[i]);
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  return fence.flat().join("");
}

function railFenceDecrypt(cipher, rails) {
  if (rails <= 1) return cipher;

  const fence = Array.from({ length: rails }, () =>
    Array(cipher.length).fill(null)
  );
  let rail = 0;
  let direction = 1;

  // Mark positions
  for (let i = 0; i < cipher.length; i++) {
    fence[rail][i] = "*";
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  // Fill the fence
  let index = 0;
  for (let r = 0; r < rails; r++) {
    for (let c = 0; c < cipher.length; c++) {
      if (fence[r][c] === "*") {
        fence[r][c] = cipher[index++];
      }
    }
  }

  // Read the message
  let result = "";
  rail = 0;
  direction = 1;
  for (let i = 0; i < cipher.length; i++) {
    result += fence[rail][i];
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  return result;
}

// Playfair Cipher Implementation
function playfairCipher(text, key, decrypt = false) {
  if (!key) return text;

  // Create 5x5 grid
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // J is combined with I
  const keyString = key.toUpperCase().replace(/J/g, "I");
  const used = new Set();
  let grid = "";

  // Add key letters first
  for (let char of keyString) {
    if (alphabet.includes(char) && !used.has(char)) {
      grid += char;
      used.add(char);
    }
  }

  // Add remaining letters
  for (let char of alphabet) {
    if (!used.has(char)) {
      grid += char;
    }
  }

  // Prepare text
  text = text.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
  let pairs = [];

  for (let i = 0; i < text.length; i += 2) {
    let pair = text[i];
    if (i + 1 < text.length) {
      if (text[i] === text[i + 1]) {
        pair += "X";
        i--;
      } else {
        pair += text[i + 1];
      }
    } else {
      pair += "X";
    }
    pairs.push(pair);
  }

  // Encrypt/decrypt pairs
  let result = "";
  for (let pair of pairs) {
    const pos1 = grid.indexOf(pair[0]);
    const pos2 = grid.indexOf(pair[1]);
    const row1 = Math.floor(pos1 / 5);
    const col1 = pos1 % 5;
    const row2 = Math.floor(pos2 / 5);
    const col2 = pos2 % 5;

    if (row1 === row2) {
      // Same row
      const newCol1 = decrypt ? (col1 + 4) % 5 : (col1 + 1) % 5;
      const newCol2 = decrypt ? (col2 + 4) % 5 : (col2 + 1) % 5;
      result += grid[row1 * 5 + newCol1] + grid[row2 * 5 + newCol2];
    } else if (col1 === col2) {
      // Same column
      const newRow1 = decrypt ? (row1 + 4) % 5 : (row1 + 1) % 5;
      const newRow2 = decrypt ? (row2 + 4) % 5 : (row2 + 1) % 5;
      result += grid[newRow1 * 5 + col1] + grid[newRow2 * 5 + col2];
    } else {
      // Rectangle
      result += grid[row1 * 5 + col2] + grid[row2 * 5 + col1];
    }
  }

  return result;
}

const cipherList = [
  {
    id: "caesar",
    name: "Caesar Cipher",
    description:
      "Shifts each letter by a fixed number of positions in the alphabet.",
  },
  {
    id: "vigenere",
    name: "Vigenère Cipher",
    description: "Uses a keyword to shift letters by varying amounts.",
  },
  {
    id: "railfence",
    name: "Rail Fence Cipher",
    description:
      "Writes text in zigzag pattern across multiple rails.",
  },
  {
    id: "playfair",
    name: "Playfair Cipher",
    description:
      "Encrypts pairs of letters using a 5x5 key square.",
  },
];

export default function EncryptionTool() {
  const [currentCipher, setCurrentCipher] = useState("caesar");
  const [inputText, setInputText] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [outputText, setOutputText] = useState("");

  function handleEncrypt() {
    let result = "";
    if (!inputText) {
      alert("Please enter some text to encrypt!");
      return;
    }

    switch (currentCipher) {
      case "caesar":
        result = caesarCipher(inputText, parseInt(keyInput) || 3);
        break;
      case "vigenere":
        if (!keyInput) {
          alert("Please enter a keyword for Vigenère cipher!");
          return;
        }
        result = vigenereCipher(inputText, keyInput);
        break;
      case "railfence":
        result = railFenceCipher(inputText, parseInt(keyInput) || 3);
        break;
      case "playfair":
        if (!keyInput) {
          alert("Please enter a keyword for Playfair cipher!");
          return;
        }
        result = playfairCipher(inputText, keyInput);
        break;
      default:
        break;
    }
    setOutputText(result);
  }

  function handleDecrypt() {
    let result = "";
    if (!inputText) {
      alert("Please enter some text to decrypt!");
      return;
    }

    switch (currentCipher) {
      case "caesar":
        result = caesarCipher(inputText, parseInt(keyInput) || 3, true);
        break;
      case "vigenere":
        if (!keyInput) {
          alert("Please enter a keyword for Vigenère cipher!");
          return;
        }
        result = vigenereCipher(inputText, keyInput, true);
        break;
      case "railfence":
        result = railFenceCipher(inputText, parseInt(keyInput) || 3, true);
        break;
      case "playfair":
        if (!keyInput) {
          alert("Please enter a keyword for Playfair cipher!");
          return;
        }
        result = playfairCipher(inputText, keyInput, true);
        break;
      default:
        break;
    }
    setOutputText(result);
  }

  function handleClear() {
    setInputText("");
    setKeyInput("");
    setOutputText("");
  }

  return (
    <div className="container">
      <h1>🔐 Multi-Cipher Encryption Tool</h1>

      <div className="cipher-grid">
        {cipherList.map((cipher) => (
          <div
            key={cipher.id}
            className={`cipher-card${currentCipher === cipher.id ? " active" : ""}`}
            onClick={() => setCurrentCipher(cipher.id)}
          >
            <div className="cipher-name">{cipher.name}</div>
            <div className="cipher-description">{cipher.description}</div>
          </div>
        ))}
      </div>

      <div className="main-interface">
        <div className="input-section">
          <label htmlFor="inputText">Input Text:</label>
          <textarea
            id="inputText"
            placeholder="Enter your message here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />

          <label htmlFor="keyInput">Encryption Key:</label>
          <input
            type="text"
            id="keyInput"
            className="key-input"
            placeholder="Enter key (number for Caesar, word for others)"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
          />

          <div className="button-group">
            <button className="encrypt-btn" onClick={handleEncrypt}>
              🔒 Encrypt
            </button>
            <button className="decrypt-btn" onClick={handleDecrypt}>
              🔓 Decrypt
            </button>
            <button className="clear-btn" onClick={handleClear}>
              🗑️ Clear
            </button>
          </div>
        </div>

        <div className="output-section">
          <label htmlFor="outputText">Output Text:</label>
          <textarea
            id="outputText"
            placeholder="Encrypted/decrypted text will appear here..."
            value={outputText}
            readOnly
          />
        </div>
      </div>

      <div className="info-panel">
        <div className="info-title">
          Current Cipher: <span id="currentCipher">{cipherInfo[currentCipher].name}</span>
        </div>
        <div className="info-text" id="cipherInfo">
          {cipherInfo[currentCipher].description}
        </div>
      </div>
    </div>
  );
}