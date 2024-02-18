import { ConnectWallet, Web3Button, createMerkleTreeFromAllowList, getProofsForAllowListEntry, useAddress, useContract, useTokenBalance } from "@thirdweb-dev/react";
import styles from "../styles/Home.module.css";
import { NextPage } from "next";
import { useState } from "react";
import { utils } from "ethers";

const Home: NextPage = () => {
  const allowList = [
    {
      "address": "0x227E7CF068E7d932C5123155E42091D5aaDF7A0f",
      "maxClaimable": "2500"
    },
    {
      "address": "0xe7eB54615C1CA35fa6879947778d713D1Ca9CD76",
      "maxClaimable": "2500"
    },
    {
      "address": "0x648F06673985554696d7E52E257cb17e2E189936",
      "maxClaimable": "2500"
    },
    {
      "address": "0xA37AB07CaE56C064eEB36b59a39817c6fDa93762",
      "maxClaimable": "2500"
    }
  ];

  const [merkleRoot, setMerkleRoot] = useState<string | null>(null);

  const generateMerkleTree = async () => {
    const merkleTree = await createMerkleTreeFromAllowList(allowList);
    setMerkleRoot(merkleTree.getHexRoot());
  };

  const getUserProof = async (address: string) => {
    const merkleTree = await createMerkleTreeFromAllowList(allowList);
    const leaf = {
      "address": address,
      "maxClaimable": "2500"
    };
    const proof = await getProofsForAllowListEntry(merkleTree, leaf);
    const proofHash = "0x" + proof[0].data.toString("hex");
    return proofHash;
  };

  const address = useAddress();
  const { contract: tokenContract } = useContract("0xCc273dBf63548a9C4d31Db1cf1be37FCC02b4EA1");
  const { data: tokenBalance } = useTokenBalance(tokenContract, address);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <ConnectWallet />
        {address && (
          <div>
            <div style={{
                backgroundColor: "#222",
                padding: "2rem",
                borderRadius: "1rem",
                textAlign: "center",
                minWidth: "500px",
                marginBottom: "2rem",
                marginTop: "2rem",
              }}>
                <h1>Create Merkle Tree</h1>
                <button
                  onClick={generateMerkleTree}
                  style={{
                    padding: "1rem",
                    borderRadius: "8px",
                    backgroundColor: "#FFF",
                    color: "#333",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "1rem",
                  }}
                >Generate</button>
                {merkleRoot && (
                  <p>Merkle Root Hash: {merkleRoot}</p>
                )}
              </div>
              <div style={{
                backgroundColor: "#222",
                padding: "2rem",
                borderRadius: "1rem",
                textAlign: "center",
                minWidth: "500px",
              }}>
                <h1>ERC-20 Airdrop</h1>
                <h3>Token balance: {tokenBalance?.displayValue}</h3>
                <Web3Button
                  contractAddress="0xf7cB477d34164E839e4dcc664a27339188121a0f"
                  action={async (contract) => contract.call(
                    "claim",
                    [
                      address,
                      utils.parseEther("1000"),
                      [await getUserProof(address)],
                      utils.parseEther("2500"),
                    ]
                  )}
                  onError={() => alert("Not eligible for airdrop or already claimed!")}
                  onSuccess={() => alert("Airdrop claimed!")}
                >Claim Airdrop</Web3Button>
              </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
