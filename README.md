# n8n-nodes-story

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for **Story Protocol** - the programmable IP infrastructure for registering, licensing, and managing intellectual property on-chain. This node provides full access to Story Protocol's features including IP asset management, programmable licenses (PIL), derivatives, royalty flows, and dispute resolution.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Story Protocol](https://img.shields.io/badge/Story-Protocol-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **IP Asset Management**: Register NFTs as IP assets, transfer ownership, manage metadata
- **Programmable IP License (PIL)**: Attach license terms, mint license tokens, verify licenses
- **Derivative Works**: Create derivatives, link to parents, track lineage trees
- **Royalty System**: Pay royalties, claim revenue, view distribution flows
- **Dispute Resolution**: Raise disputes, resolve conflicts, manage arbitration
- **Story Protocol Gateway (SPG)**: Batch operations for efficient on-chain interactions
- **Full Network Support**: Mainnet and Aeneid Testnet
- **Real-time Triggers**: Monitor IP events on-chain

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-story`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the package
npm install n8n-nodes-story
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-story.git
cd n8n-nodes-story

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-story

# Restart n8n
n8n start
```

## Credentials Setup

### Story Protocol Credentials

Used for blockchain transactions (registering IP, licensing, royalties, etc.)

| Field | Description |
|-------|-------------|
| Network | Select Mainnet or Aeneid Testnet |
| Private Key | Your wallet's private key (for signing transactions) |
| RPC URL | (Optional) Custom RPC endpoint |

### Story API Credentials

Used for indexed data queries (listing IPs, getting metadata, etc.)

| Field | Description |
|-------|-------------|
| API Key | Your Story Protocol API key |
| Network | Select Mainnet or Aeneid Testnet |
| Custom Endpoint | (Optional) Custom API endpoint |

## Resources & Operations

### IP Asset

| Operation | Description |
|-----------|-------------|
| Register | Register an NFT as an IP Asset |
| Get | Get IP Asset details by ID |
| List | List IP Assets with filters |
| Transfer | Transfer IP Asset ownership |
| Metadata | Get or update IP Asset metadata |

### License

| Operation | Description |
|-----------|-------------|
| Attach | Attach license terms to an IP Asset |
| Mint | Mint license tokens |
| Get | Get license information |
| Verify | Verify license validity for a holder |

### Derivative

| Operation | Description |
|-----------|-------------|
| Register | Register a derivative work |
| Link | Link derivative using license tokens |
| Lineage | Get IP lineage tree (ancestors/descendants) |
| List | List derivatives or parents |

### Royalty

| Operation | Description |
|-----------|-------------|
| Claim | Claim accumulated royalty revenue |
| Pay | Pay royalty to an IP Asset |
| Balance | Get royalty balance information |
| Distribution | Get royalty distribution details |

### Dispute

| Operation | Description |
|-----------|-------------|
| Raise | Raise a dispute against an IP |
| Resolve | Resolve an existing dispute |
| Get | Get dispute details |

### Module

| Operation | Description |
|-----------|-------------|
| Get | Get protocol module information |

### Group

| Operation | Description |
|-----------|-------------|
| Get | Get IP group information |

### SPG (Story Protocol Gateway)

| Operation | Description |
|-----------|-------------|
| Mint and Register | Mint NFT and register as IP in one transaction |
| Batch | Execute batch operations |

## Trigger Node

The **Story Protocol Trigger** node monitors on-chain events:

### Supported Events

- **IP Asset Registered**: New IP asset registered
- **IP Asset Transferred**: IP ownership changed
- **License Terms Attached**: License attached to IP
- **License Token Minted**: New license tokens created
- **Derivative Registered**: New derivative work registered
- **Royalty Paid**: Royalty payment made
- **Royalty Claimed**: Royalty revenue claimed
- **Dispute Raised**: New dispute created
- **Dispute Resolved**: Dispute resolved

## Usage Examples

### Register an IP Asset

```javascript
// Configure Story Protocol credentials
// Then use the Story Protocol node:

Resource: IP Asset
Operation: Register
Token Contract: 0x1234...  // Your NFT contract
Token ID: 1                 // The NFT token ID
```

### Attach Commercial License Terms

```javascript
Resource: License
Operation: Attach
IP ID: 0xabcd...           // Your IP Asset ID
License Type: Commercial Use
Revenue Share: 10%         // 10% royalty to parent
Minting Fee: 0.01          // Fee in IP (native token)
```

### Create a Derivative Work

```javascript
Resource: Derivative
Operation: Register
Child IP ID: 0x5678...     // Your derivative IP
Parent IP IDs: 0xabcd...   // Parent IP(s)
License Terms IDs: 1       // License terms to use
```

### Claim Royalty Revenue

```javascript
Resource: Royalty
Operation: Claim
IP ID: 0xabcd...           // IP Asset to claim from
Token: IP                  // Currency (IP or USDC)
```

### Monitor New IP Registrations

```javascript
// Use Story Protocol Trigger node:
Event: IP Asset Registered
Network: Mainnet
Polling Interval: 60       // Check every 60 seconds
```

## Story Protocol Concepts

### IP Asset
An on-chain representation of intellectual property. Created by registering an NFT with the IP Asset Registry.

### PIL (Programmable IP License)
Customizable license terms that define how IP can be used, including:
- Commercial use permissions
- Derivative work allowances
- Revenue share requirements
- Attribution requirements

### License Types

| Type | Commercial Use | Derivatives | Revenue Share |
|------|---------------|-------------|---------------|
| Non-Commercial Social Remixing | No | Yes | 0% |
| Commercial Use | Yes | No | Configurable |
| Commercial Remix | Yes | Yes | Configurable |
| Custom | Configurable | Configurable | Configurable |

### Derivative
A child IP that links to one or more parent IPs via license tokens. Derivatives must respect parent license terms.

### Lineage
The family tree of IP relationships. Track ancestors (parents, grandparents) and descendants (children, grandchildren).

### Royalty Flow
Revenue flows up the lineage tree based on license terms:
1. Payment enters child IP Account
2. Revenue share distributed to parents
3. Continues recursively up the tree
4. Rights holders can claim their share

## Networks

| Network | Chain ID | Description |
|---------|----------|-------------|
| Mainnet | 1513 | Production network |
| Aeneid | 1315 | Testnet for development |

## Error Handling

The node provides detailed error messages for common issues:

- **Invalid Address**: Check that all addresses are valid Ethereum addresses
- **Insufficient Funds**: Ensure wallet has enough IP tokens for gas
- **License Not Found**: Verify the license terms ID exists
- **Unauthorized**: Check that wallet has permission for the operation
- **Network Error**: Verify RPC endpoint is accessible

## Security Best Practices

1. **Never share private keys**: Use environment variables or n8n credentials
2. **Test on Aeneid first**: Always test workflows on testnet before mainnet
3. **Use separate wallets**: Create dedicated wallets for automation
4. **Monitor gas costs**: Set appropriate gas limits
5. **Validate inputs**: Ensure addresses and IDs are correct before transactions

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Watch mode for development
npm run dev
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests (`npm test`)
5. Submit a pull request

## Support

- **Documentation**: [Story Protocol Docs](https://docs.story.foundation/)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-story/issues)
- **Community**: [Story Protocol Discord](https://discord.gg/storyprotocol)

## Acknowledgments

- [Story Protocol](https://story.foundation/) for the programmable IP infrastructure
- [n8n](https://n8n.io/) for the workflow automation platform
- [ethers.js](https://docs.ethers.org/) for Ethereum interactions
