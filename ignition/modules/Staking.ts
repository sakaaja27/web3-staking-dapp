import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import StakingTokenModule from "./StakingToken";

export default buildModule("StakingModule", (m) => {
  const { stakingToken } = m.useModule(StakingTokenModule);

  // Gunakan StakingToken yang sama sebagai reward token
  const staking = m.contract("Staking", [stakingToken, stakingToken]);

  return { staking, stakingToken };
});
