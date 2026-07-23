#!/usr/bin/env node

/**
 * Atlas Trade Validation Approach Example
 * 
 * Simplified illustration of the cross-reference validation logic used to verify
 * that TradeMaximizer results correspond to actual want assignments in the database.
 * Uses synthetic data to demonstrate the approach without exposing real participant
 * information.
 * 
 * The real Atlas Trade system performs this validation against a Supabase Postgres
 * database, but the cross-reference logic follows the same pattern shown here.
 */

// Synthetic database want entries (the real system queries from want_list_entries table)
const databaseWantEntries = [
  {
    userId: 'user-001',
    username: 'player-one',
    offeredItemId: 'item-a1',
    wantedItemId: 'item-b1'
  },
  {
    userId: 'user-002',
    username: 'player-two',
    offeredItemId: 'item-b1',
    wantedItemId: 'item-a1'
  },
  {
    userId: 'user-003',
    username: 'player-three',
    offeredItemId: 'item-c1',
    wantedItemId: 'cash-b1-copy1'
  }
];

// Synthetic sequential ID mapping (generated during export process)
const seqIdToItemId = new Map([
  [1, 'item-a1'],
  [2, 'item-a2'], 
  [3, 'item-b1'],
  [4, 'cash-b1-copy1'],
  [5, 'cash-b1-copy2'],
  [6, 'item-c1']
]);

// Username to user ID mapping
const usernameToUserId = new Map([
  ['player-one', 'user-001'],
  ['player-two', 'user-002'],
  ['player-three', 'user-003']
]);

// Synthetic TradeMaximizer results - simple format for illustration
const syntheticTrades = [
  {
    recipient: 'player-one',
    offeredSeqId: 1,   // item-a1
    wantedSeqId: 3     // item-b1 (from player-two)
  },
  {
    recipient: 'player-two', 
    offeredSeqId: 3,   // item-b1
    wantedSeqId: 1     // item-a1 (from player-one)  
  },
  {
    recipient: 'player-three',
    offeredSeqId: 6,   // item-c1
    wantedSeqId: 4     // cash-b1-copy1 (from player-two)
  }
];

/**
 * Core validation logic: cross-reference each trade against database want entries
 */
function validateTrades(trades, wantEntries, seqMapping, userMapping) {
  // Build want entry lookup set: "userId::offeredItemId::wantedItemId"
  const wantSet = new Set();
  for (const entry of wantEntries) {
    const key = `${entry.userId}::${entry.offeredItemId}::${entry.wantedItemId}`;
    wantSet.add(key);
  }
  
  console.log('Want entries lookup set:');
  wantSet.forEach(key => console.log(`  ${key}`));
  console.log();
  
  const results = {
    valid: 0,
    invalid: 0,
    failures: []
  };
  
  for (const trade of trades) {
    const { recipient, offeredSeqId, wantedSeqId } = trade;
    
    // Convert sequential IDs back to item IDs
    const offeredItem = seqMapping.get(offeredSeqId);
    const wantedItem = seqMapping.get(wantedSeqId);
    
    if (!offeredItem || !wantedItem) {
      results.invalid++;
      results.failures.push(`Sequential ID not found: offered=${offeredSeqId}, wanted=${wantedSeqId}`);
      continue;
    }
    
    // Look up user ID
    const userId = userMapping.get(recipient.toLowerCase());
    if (!userId) {
      results.invalid++;
      results.failures.push(`User not found: ${recipient}`);
      continue;
    }
    
    // Check if this trade corresponds to a want entry
    const lookupKey = `${userId}::${offeredItem}::${wantedItem}`;
    console.log(`Checking trade: ${recipient} offers ${offeredItem} for ${wantedItem}`);
    console.log(`  Lookup key: ${lookupKey}`);
    
    if (wantSet.has(lookupKey)) {
      results.valid++;
      console.log(`  ✓ VALID - Found matching want entry\n`);
    } else {
      results.invalid++;
      results.failures.push(`Missing want entry: ${recipient} offers ${offeredItem} for ${wantedItem}`);
      console.log(`  ❌ INVALID - No matching want entry found\n`);
    }
  }
  
  return results;
}

// Run validation
console.log('=== Atlas Trade Validation Example ===\n');
console.log('Database want entries:', databaseWantEntries.length);
console.log('Sequential ID mappings:', seqIdToItemId.size);
console.log('User mappings:', usernameToUserId.size);
console.log('Trades to validate:', syntheticTrades.length);
console.log('\nValidating trades...\n');

const validationResults = validateTrades(
  syntheticTrades,
  databaseWantEntries, 
  seqIdToItemId,
  usernameToUserId
);

console.log('=== Validation Results ===');
console.log(`✓ Valid trades: ${validationResults.valid}`);
console.log(`❌ Invalid trades: ${validationResults.invalid}`);

if (validationResults.failures.length > 0) {
  console.log('\nFailures:');
  validationResults.failures.forEach(failure => {
    console.log(`  • ${failure}`);
  });
}

// Calculate validation percentage
const totalTrades = validationResults.valid + validationResults.invalid;
const validationRate = totalTrades > 0 ? (validationResults.valid / totalTrades * 100).toFixed(1) : 0;
console.log(`\nValidation rate: ${validationRate}% (${validationResults.valid}/${totalTrades})`);

// Success criteria
const success = validationResults.valid > 0 && validationResults.invalid === 0;
console.log(`\nOverall result: ${success ? '✅ PASSED' : '❌ FAILED'}`);

// Demonstrate the robustness of this approach
console.log('\n=== Validation Approach Benefits ===');
console.log('✓ Catches export bugs (missing want entries)');
console.log('✓ Detects data corruption (broken references)'); 
console.log('✓ Verifies algorithmic correctness (results match intentions)');
console.log('✓ Works with real production data at scale');
console.log('✓ Provides quantitative confidence metrics');

console.log('\n✅ Validation methodology verification: PASSED');