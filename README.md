# SoundTrek
A decentralized application for creating and sharing location-based audio diaries and soundscapes on the Stacks blockchain.

## Features
- Create audio diary entries linked to specific locations
- Share soundscapes with other users
- Discovery of nearby soundscapes
- Token-gated access controls
- Monetization options for creators

## Setup and Installation
1. Clone the repository
2. Install Clarinet
3. Run `clarinet check` to verify contracts
4. Run `clarinet test` to execute test suite

## Usage Examples
```clarity
;; Create a new audio diary entry
(contract-call? .soundtrek create-entry 
  "Summer Beach Waves" 
  u"https://ipfs.io/ipfs/QmXyz..." 
  {latitude: 34.0522, longitude: -118.2437}
)

;; Share entry with specific user
(contract-call? .soundtrek share-entry 
  u1 
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
)

;; Get nearby entries
(contract-call? .soundtrek get-nearby-entries
  {latitude: 34.0522, longitude: -118.2437}
  u10 ;; radius in km
)
```

## Dependencies
- Clarity language
- Clarinet for testing and deployment
- IPFS for audio storage
