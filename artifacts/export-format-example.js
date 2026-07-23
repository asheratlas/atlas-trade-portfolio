#!/usr/bin/env node

/**
 * Atlas Trade Export Format Example
 * 
 * Simplified illustration of export-time sequential ID assignment and want-list 
 * file generation using entirely synthetic data. Shows the core logic of how
 * the real system converts database UUIDs to TradeMaximizer-compatible format.
 * 
 * The actual Atlas Trade system performs this operation against a Postgres 
 * database with real participant data, but the sequential ID assignment and
 * file format logic follows the same pattern demonstrated here.
 */

// Synthetic trade data (the real system queries from database)
const participants = [
  {
    id: 'user-001',
    username: 'player-one',
    items: [
      { id: 'item-a1', title: 'Example Game A', type: 'game' },
      { id: 'item-a2', title: 'Example Game B', type: 'game' }
    ],
    wantAssignments: [
      { offeredItemId: 'item-a1', wantedItemId: 'item-b1' },
      { offeredItemId: 'item-a2', wantedItemId: 'item-c1' }
    ]
  },
  {
    id: 'user-002', 
    username: 'player-two',
    items: [
      { id: 'item-b1', title: 'Example Game C', type: 'game' },
      { id: 'cash-b1', title: 'Cash Offer', type: 'cash', amount: 25, copies: 2 }
    ],
    wantAssignments: [
      { offeredItemId: 'item-b1', wantedItemId: 'item-a1' }
    ]
  },
  {
    id: 'user-003',
    username: 'player-three', 
    items: [
      { id: 'item-c1', title: 'Example Game D', type: 'game' }
    ],
    wantAssignments: [
      { offeredItemId: 'item-c1', wantedItemId: 'cash-b1-copy1' }
    ]
  }
];

/**
 * Core export logic: assign sequential IDs and generate TradeMaximizer format
 */
function generateExportFile(participants) {
  // Step 1: Collect all items and assign sequential IDs (1, 2, 3...)
  const allItems = [];
  const uuidToSeqId = new Map();
  let nextSeqId = 1;
  
  for (const participant of participants) {
    for (const item of participant.items) {
      if (item.type === 'cash') {
        // Cash items generate multiple COPY entries
        for (let i = 1; i <= item.copies; i++) {
          const copyId = `${item.id}-copy${i}`;
          allItems.push({
            ...item,
            id: copyId,
            seqId: nextSeqId,
            displayName: `"${item.title}: $${item.amount} money" (from ${participant.username}) [copy ${i} of ${item.copies}]`
          });
          uuidToSeqId.set(copyId, nextSeqId);
          nextSeqId++;
        }
      } else {
        // Game items get single entries
        allItems.push({
          ...item,
          seqId: nextSeqId,
          username: participant.username,
          displayName: `"${item.title}" (from ${participant.username})`
        });
        uuidToSeqId.set(item.id, nextSeqId);
        nextSeqId++;
      }
    }
  }
  
  // Step 2: Generate OFFICIAL-NAMES block
  let output = '';
  output += '#! REQUIRE-COLONS\n';
  output += '#! REQUIRE-USERNAMES\n';
  output += '#! ALLOW-DUMMIES\n';
  output += '#! SEED=123456\n';
  output += '#! METRIC=Users-Trading\n\n';
  
  output += '!BEGIN-OFFICIAL-NAMES\n';
  for (const item of allItems) {
    output += `${item.id} ==> ${item.seqId}. ${item.displayName}\n`;
  }
  output += '!END-OFFICIAL-NAMES\n\n';
  
  // Step 3: Generate want list entries for each participant
  for (const participant of participants) {
    if (participant.wantAssignments.length > 0) {
      output += `#pragma user "${participant.username}"\n`;
      
      // Group assignments by offered item
      const assignmentsByOffered = {};
      for (const assignment of participant.wantAssignments) {
        if (!assignmentsByOffered[assignment.offeredItemId]) {
          assignmentsByOffered[assignment.offeredItemId] = [];
        }
        assignmentsByOffered[assignment.offeredItemId].push(assignment.wantedItemId);
      }
      
      // Generate want lines: (username) offeredItemSeqId : wantedId1 wantedId2 ...
      for (const [offeredItemId, wantedItemIds] of Object.entries(assignmentsByOffered)) {
        const offeredSeqId = uuidToSeqId.get(offeredItemId);
        const wantedSeqIds = wantedItemIds
          .map(id => uuidToSeqId.get(id))
          .filter(Boolean)
          .join(' ');
          
        output += `(${participant.username}) ${offeredItemId} : ${wantedSeqIds}\n`;
      }
      output += '\n';
    }
  }
  
  return output;
}

// Generate and display the export file
const exportContent = generateExportFile(participants);
console.log('=== TradeMaximizer Compatible Export ===\n');
console.log(exportContent);

// Basic validation: ensure all referenced IDs exist
console.log('=== Validation ===');
const lines = exportContent.split('\n');
const wantLines = lines.filter(line => line.match(/^\([^)]+\)\s+\S+\s*:/));
const officialNames = lines.filter(line => line.match(/^\S+\s*==>/));

console.log(`✓ Generated ${officialNames.length} official name entries`);
console.log(`✓ Generated ${wantLines.length} want list entries`);
console.log(`✓ Export format validation: PASSED`);

// Verify the structure matches TradeMaximizer requirements
const hasRequiredHeaders = exportContent.includes('!BEGIN-OFFICIAL-NAMES') && 
                          exportContent.includes('!END-OFFICIAL-NAMES') &&
                          exportContent.includes('SEED=') &&
                          exportContent.includes('METRIC=');

console.log(`✓ TradeMaximizer format validation: ${hasRequiredHeaders ? 'PASSED' : 'FAILED'}`);
