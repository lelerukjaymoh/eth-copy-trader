// SPDX-License-Identifier: MIT

pragma solidity >=0.8.9;

interface IERC20 {
    function totalSupply() external view returns (uint256);

    function balanceOf(address account) external view returns (uint256);

    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
}

interface IUniswapV2Router02 {
    function swapExactTokensForTokensSupportingFeeOnTransferTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external;
}

// Contract Context
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// Controls the owner of the contract
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _setOwner(_msgSender());
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function _setOwner(address newOwner) private {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// Contract to make buys and sells
contract CopyV2 is Ownable {
    // These values should be updated on deploying to different chains
    IUniswapV2Router02 pancakeSwapRouter =
        IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    uint256 MAX_INT = ~uint256(0);
    IERC20 weth = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    constructor() {
        weth.approve(address(pancakeSwapRouter), MAX_INT);
    }

    function buyatoken(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] memory path
    ) external onlyOwner {
        pancakeSwapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                amountIn,
                amountOutMin,
                path,
                address(this),
                block.timestamp
            );
    }

    function sellall(uint256 amountOutMin, address[] memory path)
        external
        onlyOwner
    {
        uint256 _fromBalance = IERC20(path[0]).balanceOf(address(this));

        IERC20(path[0]).approve(address(pancakeSwapRouter), _fromBalance);

        pancakeSwapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                _fromBalance,
                amountOutMin,
                path,
                address(this),
                block.timestamp
            );
    }

    function sellspecificamount(
        uint256 _amountIn,
        uint256 amountOutMin,
        address[] memory path
    ) external onlyOwner {
        IERC20(path[0]).approve(address(pancakeSwapRouter), _amountIn);

        pancakeSwapRouter.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                _amountIn,
                amountOutMin,
                path,
                address(this),
                block.timestamp
            );
    }

    function approving(IERC20 wbnb, address spender) external onlyOwner {
        wbnb.approve(spender, MAX_INT);
    }

    function withdrawthem(IERC20 tokenContract, uint256 amount)
        external
        onlyOwner
    {
        tokenContract.transfer(owner(), amount);
    }

    function withdrawthemall(IERC20 tokenContract) external onlyOwner {
        tokenContract.transfer(owner(), tokenContract.balanceOf(address(this)));
    }

    function destroySmartContract(address payable _to) public onlyOwner {
        selfdestruct(_to);
    }
}
