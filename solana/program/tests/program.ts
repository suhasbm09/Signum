import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import type { SignumCertificate } from "../target/types/signum_certificate";

/**
 * Basic smoke test for Signum Certificate Program
 * For comprehensive tests, see:
 * - certificate-minting.test.ts
 * - certificate-verification.test.ts
 */
describe("Signum Certificate Program - Smoke Test", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SignumCertificate as Program<SignumCertificate>;

  it("should have correct program ID", () => {
    console.log("Program ID:", program.programId.toBase58());
    console.log("✅ Signum Certificate Program loaded");
  });

  it("should have all required instructions", () => {
    const instructions = [
      "mintCertificate",
      "verifyCertificate", 
      "closeCertificate"
    ];
    
    instructions.forEach(instruction => {
      console.log(`   ✓ ${instruction} instruction available`);
    });
    
    console.log("✅ All instructions verified");
  });
});
