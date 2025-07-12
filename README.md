# Vault 🌐🔐

**Vault** is a lightweight Web3 wallet built with **Next.js** and **TypeScript** that allows users to generate Ethereum and Solana-compatible key pairs directly in the browser — with no backend required. Keys are generated entirely client-side using secure cryptographic methods.

---

## 🚀 Features

- 🔐 Generate secure public/private key pairs
- 🌍 Ethereum (ECDSA) and Solana (ED25519) support
- ⚡ 100% client-side
- 🧑‍💻 Modern UI built with React & TypeScript
- 📋 Easy to copy and store keys

---

## 🧱 Tech Stack

- [Next.js](https://nextjs.org) — React Framework
- [TypeScript](https://www.typescriptlang.org/) — Static Typing
- libraries : tweetnacl, bip39, ed25519-hd-key, @solana/web3.js, bs58, ethers
- CSS Modules or Tailwind CSS for styling (based on project setup)

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Asif-Ali-13/vault.git
cd vault
```

### 2. Install the dependencies
```bash
npm install
# or
yarn install
```

### 3. Run the development Server
```bash
npm run dev
# or
yarn dev
```

### 4. Project Structure 
```bash
vault/
├── app/               # Next.js pages and layouts
├── components/        # UI components (buttons, outputs, etc.)
├── lib/               # Key generation logic for Ethereum & Solana
├── public/            # Static files (icons, images)
├── next.config.ts     # Next.js configuration
├── tsconfig.json      # TypeScript configuration
└── package.json       # Project metadata and scripts
```

### 5. Contributing
1. Fork this repository
2. Create your feature branch:
```bash 
git checkout -b feature/your-feature-name
```
3. Commit your changes:
```bash 
git commit -m "Add your message"
```
4. Push to the branch:
```bash 
git push origin feature/your-feature-name
```
5. Open a Pull Request 🎉

### 6. License
This project is licensed under the MIT License.

### 7. 🙋‍♂️ Contact
Made with ❤️ by Asif Ali

For issues, suggestions, or contributions, feel free to open a GitHub issue or discussion.