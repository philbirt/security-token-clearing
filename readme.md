---
stability: experimental
---

security-token-clearing
==

There is a huge space of possible ways to implement and administer permissioned
ERC20 tokens.  This library aims to define an interface abstracting away those
details of token implementation which exchange operators do not need to know. 

Supported tokens
--

- (WIP) Securitize Digital Securities (DS) standard
- (WIP) PolyMath ST20
- (WIP) TokenSoft (ERC 1404) 
- (WIP) OpenFinance S3

Three stage clearing model
--

Token clearing naturally falls into three stages:

1. Configuration.  The exchange system, token contracts,
   issuer system, and possibly platform system should be made consistent with
   respect to investor and security metadata.
2. Testing for obstructions.  The transfer should be speculatively executed.
   The resulting errors should be rectified or passed on to the user. 
3. Execution.  Value should be transferred.
