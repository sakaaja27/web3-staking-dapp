# Web3 Staking dApp — Panduan Penggunaan & Deploy

Proyek dApp staking sederhana menggunakan Hardhat v3 (Viem), Solidity, OpenZeppelin, Next.js, Wagmi, dan RainbowKit.

---

## 1. Menjalankan Smart Contract Secara Lokal (Hardhat)

1. **Compile kontrak**:
   ```bash
   npx hardhat compile
   ```
2. **Jalankan test suite**:
   ```bash
   npx hardhat test
   ```
3. **Deploy kontrak ke local network (Ignition)**:
   ```bash
   npx hardhat ignition deploy ignition/modules/Staking.ts
   ```

---

## 2. Menjalankan Frontend dApp

1. Masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Jalankan development server:
   ```bash
   npm run dev
   ```
3. Buka [http://localhost:3000](http://localhost:3000) di browser, hubungkan wallet Anda menggunakan RainbowKit, dan mulai lakukan Stake, Unstake, serta Claim Reward.

---

## 3. Deploy ke Testnet (Sepolia)

1. Pastikan Keystore Hardhat terisi RPC URL dan Private Key:
   ```bash
   npx hardhat keystore set SEPOLIA_RPC_URL
   npx hardhat keystore set SEPOLIA_PRIVATE_KEY
   ```
2. Deploy kontrak ke jaringan Sepolia:
   ```bash
   npx hardhat ignition deploy ignition/modules/Staking.ts --network sepolia
   ```
3. Update contract address di file `frontend/app/page.tsx` sesuai hasil deploy Sepolia.
