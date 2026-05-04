// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

/**
 * @title Proxy
 * @dev Простой прокси-контракт, делегирующий вызовы к реализации через delegatecall.
 * Адрес реализации хранится в специальном слоте ERC-1967:
 * bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1)
 */
contract Proxy {
    // Слот ERC-1967 для адреса реализации
    bytes32 private constant IMPLEMENTATION_SLOT =
        bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);

    constructor(address _implementation, bytes memory _data) payable {
        _setImplementation(_implementation);
        if (_data.length > 0) {
            (bool success, ) = _implementation.delegatecall(_data);
            require(success, "Proxy: initialization failed");
        }
    }

    function _getImplementation() internal view returns (address) {
        address impl;
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            impl := sload(slot)
        }
        return impl;
    }

    function _setImplementation(address _implementation) internal {
        bytes32 slot = IMPLEMENTATION_SLOT;
        assembly {
            sstore(slot, _implementation)
        }
    }

    fallback() external payable {
        address impl = _getImplementation();
        require(impl != address(0), "Proxy: implementation not set");

        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    receive() external payable {
        fallback();
    }
}
