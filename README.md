## Testing LIT protocol for encrypting and decripting data based on access control condotions

### Setup
Setup .env with 2 private keys one that satisfies the conditions and one that doesn't
```bash
ALICE_KEY="jdfblsdjnfldnf......."
BOB_KEY="njkdwnc78342fgh20inef......"
```

### Run Test
```bash
node mint_credits.js
```
Take the ID and replace id in lit.js line 179

Then run
```bash
node lit.js
```
try with both bob and alice accounts in line 184.
