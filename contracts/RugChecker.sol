// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IUniswapV2Router02} from "@uniswap-v2/interfaces/IUniswapV2Router02.sol";
import {IERC20} from "@openzeppelin-contracts/token/ERC20/IERC20.sol";

interface IRugCheckResponse {
    struct RugCheckResponse {
        address token;
        uint256 estimatedBuy;
        uint256 actualBuy;
        uint256 estimatedSell;
        uint256 actualSell;
        uint256 buyGas;
        uint256 sellGas;
        // uint256 maxBuy;
        // uint256 maxSell;
    }
}

/**  
    @title      Rug Checker

    @author     lelerukjaymoh@gmail.com
    
    @notice     Check is the token is safe for you to interact with

    @dev        Contracts Checks if:
                    - a contract is a rug or not
                    - the amount of buy and sell tax charged by the token
                    - gas used for buy and sell transactions involving the token

*/

contract RugChecker is IRugCheckResponse {
    /**
        @notice     results for the check are stored here
     */

    /**
        @notice             Swaps tokenIn for tokenOut

        @dev                Swaps the tokens in the path using the swapExactTokensForTokensSupportingFeeOnTransferTokens 
                            method to facilate swapping tokens with tax
                            Requires the caller {msg.sender} to have approved the router

        @param router       router of the Dex where the swap happens

        @param path         an array of tokenIn and tokenOut token addresses to be swapped

        @param amountIn     Amount of tokens swapped In
     */

    function swap(
        IUniswapV2Router02 router,
        address[] memory path,
        uint256 amountIn
    ) internal {
        router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amountIn,
            0, // amountOutMin
            path,
            address(this),
            block.timestamp
        );
    }

    /**
        @notice     Estimates the amount out expected without taking into consideration the token tax

        @dev        Queries the pool's reserves to get the amount of tokens Out to provide for the 
                    amount of tokens In supplied. 
                    Takes into account the Dex fees charged
                    Does not take into account the on transfer tax charged by tokens
     */

    function getAmountOut(
        IUniswapV2Router02 router,
        address[] memory path,
        uint256 amountIn
    ) internal view returns (uint256 amountOut) {
        uint256[] memory amountsOut = router.getAmountsOut(amountIn, path);
        amountOut = amountsOut[amountsOut.length - 1];
    }

    /**
        @notice             Screens a token to check if it is a rug or honeypot

        @dev                Checks the amount of token got from a swap to be used to get the tax charged by the token
                            Checks the gas used for buy and selling of the token

        @param router       router of the Dex where the swap happens
        
        @param path         an array of tokenIn and tokenOut token addresses to be swapped
        
        @param amountIn     Amount of tokens swapped In
     */

    function screen(
        IUniswapV2Router02 router,
        address[] calldata path,
        uint256 amountIn
    ) external returns (RugCheckResponse memory response) {
        /*///////////////////////////////////////////
                        Prepare data
        //////////////////////////////////////////*/

        address tokenIn = path[0];
        address tokenOut = path[1];
        response.token = tokenOut;

        address[] memory sellPath = new address[](2);
        sellPath[0] = tokenOut;
        sellPath[1] = tokenIn;

        /*///////////////////////////////////////////
                        Transfer Tokens
        //////////////////////////////////////////*/

        /**
            @notice     Transfers the tokens from the caller to the rugChecker contract. 
                        This implementation is preferred over passing the amount in the {msg.value}
                        because this supports token -> token pairs not only eth / bnb -> token pairs
                        And no extra checks are needed to ensure that the base token is a stable coin or eth / bnb

            @dev        This function requires the caller {msg.sender} to have approved this contract with 
                        sufficient amount before calling it
                        Caller need to have a balance of the token In that is greater than or equal to the amount in 
                        he provides
        */

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        /*///////////////////////////////////////////
                    Buy Implementations 
        //////////////////////////////////////////*/

        /// Approve token before buying
        IERC20(tokenIn).approve(address(router), ~uint256(256));

        /**
            Estimated amount of tokens out expected after a buy
         */
        response.estimatedBuy = getAmountOut(router, path, amountIn);

        uint256 tokenOutBeforeBuy = IERC20(tokenOut).balanceOf(address(this));

        uint256 gasBeforeBuy = gasleft();

        swap(router, path, amountIn);

        response.buyGas = gasBeforeBuy - gasleft();

        /**
            Actual amount of tokens out received after an actual buy 
                => token_out_amount_after_buy - token_out_amount_before_buy
         */
        uint256 tokenOutAfterBuy = IERC20(tokenOut).balanceOf(address(this));

        response.actualBuy = tokenOutAfterBuy - tokenOutBeforeBuy;

        /*///////////////////////////////////////////
                    Sell Implementations 
        //////////////////////////////////////////*/

        /// Approve token before selling
        IERC20(tokenOut).approve(address(router), ~uint256(256));

        /**
            Estimated amount of tokens out expected after a sell
         */
        response.estimatedSell = getAmountOut(router, sellPath, amountIn);

        uint256 tokenInBeforeSell = IERC20(tokenIn).balanceOf(address(this));

        uint256 gasBeforeSell = gasleft();

        swap(router, sellPath, tokenOutAfterBuy);

        response.sellGas = gasBeforeSell - gasleft();

        /**
            Actual amount of tokens out received after an actual buy 
                => token_in_amount_after_sell - token_in_amount_before_sell
         */
        uint256 tokenInAfterSell = IERC20(tokenIn).balanceOf(address(this));

        response.actualSell = tokenInAfterSell - tokenInBeforeSell;
    }
}
