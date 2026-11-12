import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

export default buildModule("StakingTokenModule", (m) => {
  const initialSupply = m.getParameter("initialSupply", parseEther("1000"));

  const stakingToken = m.contract("StakingToken", [initialSupply]);

  return { stakingToken };
});