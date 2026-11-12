// SPDX-License-Identifier: MIT
pragma solidity ^0.8.34;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Staking is ReentrancyGuard {
  using SafeERC20 for IERC20;

  IERC20 public immutable stakingToken;
  IERC20 public immutable rewardToken;

  uint256 public constant REWARD_RATE_PER_SECOND = 1e15; // 0.001 reward per second per staked token unit

  uint256 public totalSupply;
  mapping(address => uint256) public balanceOf;

  mapping(address => uint256) public userRewardPerTokenPaid;
  mapping(address => uint256) public rewards;

  uint256 public rewardPerTokenStored;
  uint256 public lastUpdateTime;

  event Staked(address indexed user, uint256 amount);
  event Withdrawn(address indexed user, uint256 amount);
  event RewardPaid(address indexed user, uint256 reward);

  constructor(address _stakingToken, address _rewardToken) {
    stakingToken = IERC20(_stakingToken);
    rewardToken = IERC20(_rewardToken);
    lastUpdateTime = block.timestamp;
  }

  function rewardPerToken() public view returns (uint256) {
    if (totalSupply == 0) {
      return rewardPerTokenStored;
    }
    return rewardPerTokenStored + (((block.timestamp - lastUpdateTime) * REWARD_RATE_PER_SECOND * 1e18) / totalSupply);
  }

  function earned(address account) public view returns (uint256) {
    return ((balanceOf[account] * (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) + rewards[account];
  }

  modifier updateReward(address account) {
    rewardPerTokenStored = rewardPerToken();
    lastUpdateTime = block.timestamp;
    if (account != address(0)) {
      rewards[account] = earned(account);
      userRewardPerTokenPaid[account] = rewardPerTokenStored;
    }
    _;
  }

  function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
    require(amount > 0, "Cannot stake 0");
    totalSupply += amount;
    balanceOf[msg.sender] += amount;
    stakingToken.safeTransferFrom(msg.sender, address(this), amount);
    emit Staked(msg.sender, amount);
  }

  function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
    require(amount > 0, "Cannot withdraw 0");
    require(balanceOf[msg.sender] >= amount, "Insufficient staked balance");
    totalSupply -= amount;
    balanceOf[msg.sender] -= amount;
    stakingToken.safeTransfer(msg.sender, amount);
    emit Withdrawn(msg.sender, amount);
  }

  function claimReward() external nonReentrant updateReward(msg.sender) {
    uint256 reward = rewards[msg.sender];
    if (reward > 0) {
      rewards[msg.sender] = 0;
      rewardToken.safeTransfer(msg.sender, reward);
      emit RewardPaid(msg.sender, reward);
    }
  }
}
