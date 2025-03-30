import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Can create audio diary entry",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const block = chain.mineBlock([
      Tx.contractCall('soundtrek', 'create-entry', [
        types.ascii("Beach Waves"),
        types.ascii("https://ipfs.io/ipfs/Qm123..."),
        types.tuple({
          latitude: types.int(340522),
          longitude: types.int(-1182437)
        })
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectUint(1);
  }
});

Clarinet.test({
  name: "Can share entry with other user",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // First create entry
    let block = chain.mineBlock([
      Tx.contractCall('soundtrek', 'create-entry', [
        types.ascii("Beach Waves"),
        types.ascii("https://ipfs.io/ipfs/Qm123..."),
        types.tuple({
          latitude: types.int(340522),
          longitude: types.int(-1182437)
        })
      ], deployer.address)
    ]);
    
    // Then share it
    block = chain.mineBlock([
      Tx.contractCall('soundtrek', 'share-entry', [
        types.uint(1),
        types.principal(wallet1.address)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts.length, 1);
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Verify wallet1 can access entry
    const response = chain.callReadOnlyFn(
      'soundtrek',
      'get-entry',
      [types.uint(1)],
      wallet1.address
    );
    response.result.expectOk();
  }
});

Clarinet.test({
  name: "Cannot access private entry without permission",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Create private entry
    let block = chain.mineBlock([
      Tx.contractCall('soundtrek', 'create-entry', [
        types.ascii("Beach Waves"),
        types.ascii("https://ipfs.io/ipfs/Qm123..."),
        types.tuple({
          latitude: types.int(340522),
          longitude: types.int(-1182437)
        })
      ], deployer.address)
    ]);
    
    // Try to access as different user
    const response = chain.callReadOnlyFn(
      'soundtrek',
      'get-entry',
      [types.uint(1)],
      wallet1.address
    );
    response.result.expectErr().expectUint(102); // err-unauthorized
  }
});
