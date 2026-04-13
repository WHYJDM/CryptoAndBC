// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/MyToken.sol";

contract MyTokenTest is Test {
    MyToken public token;
    address public owner;
    address public addr1;
    address public addr2;

    function setUp() public {
        owner = address(this);
        addr1 = makeAddr("addr1");
        addr2 = makeAddr("addr2");
        token = new MyToken(1000000 * 10 ** 18);
    }

    function testInitialSupply() public view {
        assertEq(token.balanceOf(owner), 1000000 * 10 ** 18);
    }

    function testNameAndSymbol() public view {
        assertEq(token.name(), "MyToken");
        assertEq(token.symbol(), "MTK");
    }

    function testTransfer() public {
        token.transfer(addr1, 100 * 10 ** 18);
        assertEq(token.balanceOf(addr1), 100 * 10 ** 18);
    }

    function testTransferInsufficientBalance() public {
        vm.expectRevert();
        token.transfer(addr1, 1000001 * 10 ** 18);
    }

    function testMint() public {
        token.mint(addr1, 500 * 10 ** 18);
        assertEq(token.balanceOf(addr1), 500 * 10 ** 18);
    }

    function testRevertNonOwnerMint() public {
        vm.prank(addr1);
        vm.expectRevert();
        token.mint(addr1, 100 * 10 ** 18);
    }

    function testTotalSupply() public {
        assertEq(token.totalSupply(), 1000000 * 10 ** 18);
        token.mint(addr1, 500 * 10 ** 18);
        assertEq(token.totalSupply(), 1000500 * 10 ** 18);
    }
}
